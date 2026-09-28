import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

import type { EnvironmentVariables } from '../config/env.types';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(configService: ConfigService<EnvironmentVariables, true>) {
    const connectionString = configService.getOrThrow('DATABASE_URL');

    const adapter = new PrismaPg({
      connectionString,
    });

    super({
      adapter,
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
