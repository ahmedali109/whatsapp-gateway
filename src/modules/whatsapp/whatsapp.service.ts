import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  WHATSAPP_PROVIDER,
  type WhatsAppProvider,
} from './providers/whatsapp-provider.interface';
import { MessageRepository } from './repositories/message.repository';
import type { SendTextResult } from './types/whatsapp-message.types';

@Injectable()
export class WhatsappService {
  constructor(
    @Inject(WHATSAPP_PROVIDER)
    private readonly provider: WhatsAppProvider,
    private readonly messageRepository: MessageRepository,
  ) {}

  async sendText(number: string, text: string): Promise<SendTextResult> {
    const message = await this.messageRepository.createOutbound(number, text);

    try {
      const result = await this.provider.sendText(number, text);

      const updatedMessage = await this.messageRepository.markAsSent(
        message.id,
        result.messageId,
      );

      return {
        id: updatedMessage.id,
        providerMessageId: result.messageId,
        recipient: updatedMessage.recipient,
        status: updatedMessage.status,
      };
    } catch (error) {
      await this.messageRepository.markAsFailed(
        message.id,
        'WHATSAPP_PROVIDER_UNAVAILABLE',
        'WhatsApp provider failed to send the message',
      );

      throw error;
    }
  }

  async findMessage(id: string) {
    const message = await this.messageRepository.findById(id);

    if (!message) {
      throw new NotFoundException({
        code: 'MESSAGE_NOT_FOUND',
        message: 'Message not found',
      });
    }

    return message;
  }
}
