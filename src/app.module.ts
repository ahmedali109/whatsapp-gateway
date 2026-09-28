import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnv } from './config/env.validation';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { PrismaModule } from './database/prisma.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    PrismaModule,
    WhatsappModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
