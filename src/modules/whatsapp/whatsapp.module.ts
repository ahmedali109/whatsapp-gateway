import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { EvolutionClient } from './clients/evolution.client';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [HttpModule],
  controllers: [WhatsappController],
  providers: [WhatsappService, EvolutionClient],
  exports: [WhatsappService],
})
export class WhatsappModule {}
