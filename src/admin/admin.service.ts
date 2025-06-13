import { BadRequestException, Inject, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpsertSoalDTO } from './dto/soal.dto';
import { CreateUserDto, UpsertUserDto } from './dto/user-update.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PaginationQueryDto } from 'src/dto/pagination.dto';
import { UserSession } from 'types/auth';
import { redis } from 'utils/redislock';

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
    ) { }

    async getAllUsers(query: PaginationQueryDto) {
        const key = `users_${query.page}_${query.limit}`;
        const users = await this.cache.get(key);

        if (users) {
            return users;
        }

        const skip = (query.page - 1) * query.limit;
        const take = query.limit;
        const paginatedUsers = await this.prisma.user.findMany({
            skip,
            take,
            include: {
                result: true,
            },
        });


        await this.cache.set(key, paginatedUsers); // Cache for 1 hour


        return paginatedUsers;
    }

    private async refreshUsersCache() {
        const keys = await redis.keys('*users_*');
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    }

    async getUserById(id: string) {
        const user = await this.cache.get(`user_${id}`);
        if (user) {
            return user;
        }

        return this.prisma.user.findUnique({
            where: { id },
            include: {
                result: true
            }
        });
    }

    async createUser(data: CreateUserDto) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                nip: data.nip,
            },
        });

        if (existingUser) {
            throw new BadRequestException('NIP ini sudah ada');
        }


        const user = await this.prisma.user.create({
            data: {
                name: data.nama,
                nip: data.nip,
                client_secret: "",
                role: data.role
            },
            select: {

                name: true,
                id: true,
                client_secret: true,
                result: true,
                role: true,
                ban: true
            }
        });

        await this.refreshUsersCache()


        await this.cache.set(`user_${user.id}`, user); // Cache for 1 hour


        return user;
    }

    async deleteUser(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.refreshUsersCache()

        await this.cache.del(`user_${id}`); // Clear cache for this user


        return this.prisma.user.delete({
            where: { id },
        });
    }

    async updateUser(id: string, data: UpsertUserDto) {

        let user = await this.cache.get<UserSession>(`user_${id}`);
        if (!user) {
            user = await this.prisma.user.findUnique({
                where: { id },
                include: {
                    result: true
                }
            });
        }

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user = await this.prisma.user.update({
            where: { id },
            data: {
                name: data.nama,
                nip: data.nip,
                role: data.role,
            },
            select: {
                name: true,
                id: true,
                client_secret: true,
                result: true,
                role: true,
                ban: true
            }
        });

        await this.refreshUsersCache()
        await this.cache.set(`user_${user.id}`, user); // Cache for 1 hour


        return {
            message: "Berhasil"
        }

    }

    async deleteUserResult(id: string) {
        let user = await this.cache.get<UserSession>(`user_${id}`);
        if (!user) {
            user = await this.prisma.user.findUnique({
                where: { id },
                include: {
                    result: true
                }
            });
        }

        if (!user) {
            throw new Error('User not found');
        }

        await this.prisma.result.delete({
            where: {
                id: id
            }
        })

        await this.cache.del("user_" + id)

        return {
            message: "Berhasil"
        }
    }

    private async refreshSoalCache() {
        const keys = await redis.keys('*soals_*');
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    }

    async getAllSoal(query: PaginationQueryDto) {
        const key = `soals_${query.page}_${query.limit}`;
        const soals = await this.cache.get(key);

        if (soals) {
            return soals;
        }

        const skip = (query.page - 1) * query.limit;
        const take = query.limit;

        const paginatedSoals = await this.prisma.soal.findMany({
            skip,
            take,
        });

        await this.cache.set(key, paginatedSoals); // Cache for 1 hour

        return paginatedSoals;
    }

    async deleteSoal(id: string) {
        let soal = await this.cache.get("soal_" + id)
        if (!soal) {
            soal = await this.prisma.soal.findUnique({
                where: { id },
            });
        }

        if (!soal) {
            throw new Error('Soal not found');
        }

        await this.prisma.soal.delete({
            where: { id },
        });

        await this.cache.del("soal_" + id)
        await this.refreshSoalCache()

        return {
            message: "Success"
        }

    }

    async updateSoal(id: string, data: UpsertSoalDTO) {
        let soal = await this.cache.get("soal_" + id)
        if (!soal) {
            soal = await this.prisma.soal.findUnique({
                where: { id },
            });
        }

        if (!soal) {
            throw new Error('Soal not found');
        }

        const newSoal = await this.prisma.soal.update({
            where: { id },
            data,
        });

        await this.cache.set("soal_" + id, newSoal)

        const allSoals = await this.prisma.soal.findMany()
        await this.refreshSoalCache()

        await this.cache.set("soalsanswer", allSoals);
        await this.cache.set("soals", allSoals.map(({ answer, ...el }) => el))

        return {
            message: 'Soal updated successfully',
        }
    }

    async createSoal(data: UpsertSoalDTO) {
        const newSoal = await this.prisma.soal.create({
            data,
        });

        await this.cache.set("soal_" + newSoal.id, newSoal)


        const allSoals = await this.prisma.soal.findMany()
        
        await this.refreshSoalCache()

        await this.cache.set("soalsanswer", allSoals);
        await this.cache.set("soals", allSoals.map(({ answer, ...el }) => el))

        return {
            message: 'Soal created successfully',
        }
    }

    async getSoalById(id: string) {
        const soal = await this.prisma.soal.findUnique({
            where: { id },
        });

        if (!soal) {
            throw new Error('Soal not found');
        }

        return soal;
    }



}
