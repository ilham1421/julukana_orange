import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();

    const userAdminCount = await this.user.count({
      where : {
        role : 'ADMIN'
      }
    })

    if(userAdminCount == 0 ) {
      await this.user.create({
        data : {
          name : "IlhamAdmin",
          nip : '123123123',
          role : "ADMIN"
        }
      })
    }

  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}