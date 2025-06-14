import { Module, } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'guard/role.guard';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import Keyv from 'keyv';
import { CacheableMemory } from 'cacheable';
import KeyvRedis, { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {


        const keyv = new Keyv(new KeyvRedis({
          url: `redis://${process.env.REDIS_URL}:${process.env.REDIS_PORT}`, // The Redis server URL (use 'rediss' for TLS)
          password: process.env.REDIS_PASS, // Optional password if Redis has authentication enabled

        }), {
          ttl: 1000 * 60 * 60, // Default TTL of 24 hours
        });

        return {
          stores: keyv
        }
      },

      isGlobal: true
    }),
    AuthModule, PrismaModule, AdminModule, UserModule, RedisCacheModule],
  controllers: [AppController],
  providers: [AppService
  ],
})
export class AppModule { }
