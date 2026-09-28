import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import { EvolutionClient } from './clients/evolution.client';
import { SendTextResult } from './types/whatsapp-message.types';
import { EvolutionApiException } from './exceptions/evolution-api.exception';

@Injectable()
export class WhatsappService {
  constructor(private readonly evolutionClient: EvolutionClient) {}

  async sendText(number: string, text: string): Promise<SendTextResult> {
    try {
      const response = await this.evolutionClient.sendText(number, text);
      return {
        messageId: response.key.id,
        recipient: number,
        status: response.status,
      };
    } catch (error) {
      if (error instanceof EvolutionApiException) {
        throw new ServiceUnavailableException({
          code: 'WHATSAPP_PROVIDER_UNAVAILABLE',
          message: 'WhatsApp provider is currently unavailable',
        });
      }

      throw error;
    }
  }
}
