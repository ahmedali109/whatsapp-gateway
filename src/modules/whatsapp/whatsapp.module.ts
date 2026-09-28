import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { EvolutionClient } from './clients/evolution.client';
import { EvolutionProvider } from './providers/evolution.provider';
import { WHATSAPP_PROVIDER } from './providers/whatsapp-provider.interface';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { MessageRepository } from './repositories/message.repository';

@Module({
  imports: [HttpModule],

  controllers: [WhatsappController],

  providers: [
    WhatsappService,
    EvolutionClient,
    EvolutionProvider,
    MessageRepository,
    {
      provide: WHATSAPP_PROVIDER,
      useExisting: EvolutionProvider,
    },
  ],

  exports: [WhatsappService],
})

export class WhatsappModule {}