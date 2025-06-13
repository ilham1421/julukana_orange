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
import * as redisStore from 'cache-manager-redis-store';
import { RedlockProvider } from 'utils/redislock';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_URL, // or your Redis server IP
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379, // default Redis port
      password: process.env.REDIS_PASS, // uncomment if you set a password
      ttl: 60, // cache time-to-live in seconds
    }),
    AuthModule, PrismaModule, AdminModule, UserModule, RedisCacheModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: RolesGuard
  },
    RedlockProvider
  ],
})
export class AppModule { }
