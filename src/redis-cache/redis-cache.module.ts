import { Global, Module } from '@nestjs/common';
import { RedlockProvider } from 'utils/redislock';

@Global()
@Module({
    providers : [RedlockProvider],
    exports : [RedlockProvider]
})
export class RedisCacheModule {}
