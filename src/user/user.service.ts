import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Soal } from '@prisma/client';
import { Cache } from 'cache-manager';
import Redlock from 'redlock';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserSession } from 'types/auth';

@Injectable()
export class UserService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cache : Cache, @Inject("REDLOCK") private readonly redlock : Redlock , 
    private readonly prisma : PrismaService ) {}

    async getAllSoal(includeAnswer : boolean = false)  {

        const cacheKey = 'soals' + (includeAnswer ? "answer" : "");
        
        let soals = await this.cache.get<Soal[]>(cacheKey);

        if (soals) {
            return soals;
        }

        try {
            const lock = await this.redlock.acquire(['locks:'+cacheKey], 3000);
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
            await this.cache.set('soals', soals, 60 * 60); // Cache for 1 hour
            await lock.release();

            return soals

        }catch(err) {
            await new Promise(res => setTimeout(res, 200));
            soals = await this.cache.get(cacheKey);
            if (soals) {
                return soals;
            }
            throw err;
        }
    }

    async jawabAllSoal(userId : string, jawaban : {
        soalId : string,
        jawaban : number
    }[] ) {
        const user : UserSession= await this.cache.get(`user_${userId}`);

        if (!user) {
            throw new Error('User not found');
        }

        if(user.ban) {
            throw new BadRequestException('Anda telah dibanned');
        }

        const existingResult = user.result;

        if (existingResult) {
            throw new BadRequestException('Anda sudah mengerjakan soal');
        }

        const soal = await this.getAllSoal(true);
        
        if (!soal || soal.length === 0) {
            throw new BadRequestException('Tidak ada soal yang tersedia');
        }

        if(soal.length != jawaban.length) {
            throw new BadRequestException('Jumlah soal tidak sesuai dengan jawaban yang diberikan');
        }

        let score = 0;
        for (const item of jawaban) {
            const soalItem = soal.find(s => s.id === item.soalId);
            if (!soalItem) {
                throw new BadRequestException(`Soal dengan ID ${item.soalId} tidak ditemukan`);
            }

            if (soalItem.answer === item.jawaban) {
                score += 1;
            }
        }

        score = Math.round((score / soal.length) * 100);

        const result = await this.prisma.result.create({
            data: {
                userId: user.id,
                score: score,
            }
        })

        await this.cache.set(`user_${userId}`, {
            ...user,
            result
        }, 60 * 60); // Cache for 1 hour

        return {
            score
        }






    }
}
