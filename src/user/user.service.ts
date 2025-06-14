import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Soal } from '@prisma/client';
import { Cache } from 'cache-manager';
import Redlock from 'redlock';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserSession } from 'types/auth';
import { redis } from 'utils/redislock';

@Injectable()
export class UserService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cache: Cache, @Inject("REDLOCK") private readonly redlock: Redlock,
        private readonly prisma: PrismaService) { }

    async getAllSoal(includeAnswer: boolean = false) {

        const cacheKey = 'soals' + (includeAnswer ? "answer" : "");

        let soals = await this.cache.get<Soal[]>(cacheKey);

        if (soals) {
            return soals;
        }

        try {
            const lock = await this.redlock.acquire(['locks:' + cacheKey], 3000);
            soals = await this.cache.get(cacheKey);
            if (soals) {
                await lock.release();
                return soals;
            }

            soals = await this.prisma.soal.findMany({
                select: {
                    id: true,
                    question: true,
                    options: true,
                    answer: includeAnswer ? true : false,
                },
            });
            await this.cache.set('soals', soals); // Cache for 1 hour
            await lock.release();

            return soals

        } catch (err) {
            await new Promise(res => setTimeout(res, 500));
            soals = await this.cache.get(cacheKey);
            if (soals) {
                return soals;
            }
            throw err;
        }
    }

    async jawabAllSoal(userId: string, jawaban: {
        soalId: string,
        jawaban: number
    }[]) {
        const user: UserSession = await this.cache.get(`user_${userId}`);

        if (!user) {
            throw new Error('User not found');
        }

        if (user.ban) {
            throw new BadRequestException('Anda telah dibanned');
        }

        const existingResult = user.result;

        if (existingResult == null) throw new BadRequestException('Anda belum memulai ujian');

        if (existingResult.status !== "STARTED") {
            throw new BadRequestException('Anda sudah mengerjakan soal');
        }

        const settings = await this.getAllSettings();

        if (settings.duration_minutes == null || settings.passing_grade_percentage == null) {
            throw new BadRequestException('Pengaturan durasi ujian belum diatur');
        }

        const duration = parseInt(settings.duration_minutes);
        if (isNaN(duration) || duration <= 0) {
            throw new BadRequestException('Durasi ujian tidak valid');
        }

        const passPercentage = parseInt(settings.passing_grade_percentage);
        if (isNaN(passPercentage) || passPercentage < 0 || passPercentage > 100) {
            throw new BadRequestException('Persentase kelulusan tidak valid');
        }

        console.log(existingResult)

        const initResult = new Date(existingResult.createdAt);

        if (initResult.getTime() + duration * 60 * 1000 < Date.now()) {
            throw new BadRequestException('Waktu ujian telah habis');
        }

        const soal = await this.getAllSoal(true);

        if (!soal || soal.length === 0) {
            throw new BadRequestException('Tidak ada soal yang tersedia');
        }

        if (soal.length != jawaban.length) {
            throw new BadRequestException('Jumlah soal tidak sesuai dengan jawaban yang diberikan');
        }

        let score = 0;
        let percentage = 0;
        let foundedSoal = 0;

        for (const item of jawaban) {
            
            const soalItem = soal.find(s => s.id === item.soalId);
                    
            if (!soalItem) {
                throw new BadRequestException(`Soal dengan ID ${item.soalId} tidak ditemukan`);
            }

            foundedSoal += 1;

            if (soalItem.answer === item.jawaban) {
                score += 1;
            }



        }

        if (foundedSoal < soal.length) {
            throw new BadRequestException('Tidak semua soal terjawab');
        }

        percentage = Math.round((score / soal.length) * 100);
        if (percentage < 0 || percentage > 100) {
            throw new BadRequestException('Persentase tidak valid');
        }

        const pass_grade = parseInt(settings.pass_grade || "70");

        const isFailed = percentage < pass_grade;

        const result = await this.prisma.result.update({
            where : {
                id: existingResult.id
            },
            data: {
                score: score,
                percentage: percentage,
                status: isFailed ? "FAILED" : "COMPLETED",
            }
        })

        await this.cache.set(`user_${userId}`, {
            ...user,
            result
        }); // Cache for 1 hour

        await this.refreshUsersResultCache();

        return {
            score
        }

    }

    async refreshUsersResultCache() {
        const keys = await redis.keys('*user_results_*');
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    }

    async getAllSettings() {
        const cacheKey = 'settings';
        let settings = await this.cache.get<{
            [key: string]: string;
        }>(cacheKey);

        if (settings) {
            return settings;
        }

        try {
            const lock = await this.redlock.acquire(['locks:' + cacheKey], 3000);
            settings = await this.cache.get(cacheKey);

            if (settings) {
                await lock.release();
                return settings;
            }

            const settingRecord = await this.prisma.setting.findMany();

            settings = settingRecord.reduce((acc, setting) => {
                acc[setting.key] = setting.value;
                return acc
            }, {});

            await this.cache.set(cacheKey, settings); // Cache for 1 hour
            await lock.release();

        } catch (err) {
            await new Promise(res => setTimeout(res, 500));
            settings = await this.cache.get(cacheKey);
            if (settings) {
                return settings;
            }
            throw err
        }
        // if (!settings) {
        //     const settingRecord = await this.prisma.setting.findMany();

        //     const settingsMap = settingRecord.reduce((acc, setting) => {
        //         acc[setting.key] = setting.value;
        //         return acc
        //     }, {});

        //     await this.cache.set(cacheKey, settingsMap);
        // }

        return settings;
    }

    async createUserResult(userId: string) {
        const user: UserSession = await this.cache.get(`user_${userId}`);

        if (!user) {
            throw new Error('User not found');
        }

        if (user.ban) {
            throw new BadRequestException('Anda telah dibanned');
        }

        const existingResult = user.result;

        if (existingResult != null) {
            throw new BadRequestException('Anda sudah mengerjakan soal');
        }

        const result = await this.prisma.result.create({
            data: {
                userId: user.id,
                score: 0,
                percentage: 0,
            }
        })

        await this.refreshUsersResultCache();
        await this.cache.set(`user_${userId}`, {
            ...user,
            result
        }); // Cache for 1 hour

        return result;
    }
}
