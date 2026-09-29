import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { EvolutionClient } from './clients/evolution.client';
import { EvolutionProvider } from './providers/evolution.provider';
import { WHATSAPP_PROVIDER } from './providers/whatsapp-provider.interface';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { MessageRepository } from './repositories/message.repository';
import { BullModule } from '@nestjs/bullmq';
import { WHATSAPP_QUEUE } from './queue/whatsapp-queue.constants';
import { WhatsappQueueService } from './queue/whatsapp-queue.service';
import { WhatsappProcessor } from './queue/whatsapp.processor';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../config/env.types';
import { EvolutionWebhookController } from './webhooks/evolution-webhook.controller';
import { EvolutionWebhookService } from './webhooks/evolution-webhook.service';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({
      name: WHATSAPP_QUEUE,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        connection: {
          host: configService.getOrThrow('REDIS_HOST'),
          port: configService.getOrThrow('REDIS_PORT'),
          db: configService.getOrThrow('REDIS_DB'),
        },
      }),
    }),
  ],

  controllers: [
    WhatsappController, 
    EvolutionWebhookController
  ],

  providers: [
    WhatsappService,
    WhatsappQueueService,
    WhatsappProcessor,

    EvolutionClient,
    EvolutionProvider,

    EvolutionWebhookService,

    MessageRepository,
    {
      provide: WHATSAPP_PROVIDER,
      useExisting: EvolutionProvider,
    },
  ],

  exports: [WhatsappService],
})
export class WhatsappModule {}
