import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import Redlock from 'redlock';

const redis = new Redis({
  host: process.env.REDIS_URL || 'localhost',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  password: process.env.REDIS_PASS,
});

export const RedlockProvider: Provider = {
  provide: 'REDLOCK',
  useFactory: () => {
    return new Redlock([redis], {
      retryCount: 10,
      retryDelay: 200,
    });
  },
};