import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { WhatsappQueueService } from './queue/whatsapp-queue.service';
import { MessageRepository } from './repositories/message.repository';
import type { SendTextResult } from './types/whatsapp-message.types';

@Injectable()
export class WhatsappService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly whatsappQueue: WhatsappQueueService,
  ) {}

  async sendText(
    number: string,
    text: string,
    idempotencyKey?: string,
  ): Promise<SendTextResult> {
    const queueAvailable = await this.whatsappQueue.isAvailable();

    if (!queueAvailable) {
      throw new ServiceUnavailableException({
        code: 'QUEUE_UNAVAILABLE',
        message: 'Message queue is currently unavailable',
      });
    }

    if (idempotencyKey) {
      const result = await this.messageRepository.createOutboundIdempotent(
        number,
        text,
        idempotencyKey,
      );

      if (!result.created) {
        return {
          id: result.message.id,
          recipient: result.message.recipient,
          status: result.message.status,
        };
      }

      await this.whatsappQueue.enqueueSendText(result.message.id);

      const queuedMessage = await this.enqueueMessage(result.message.id);

      return {
        id: queuedMessage.id,
        recipient: queuedMessage.recipient,
        status: queuedMessage.status,
      };
    }

    const message = await this.messageRepository.createOutbound(number, text);

    await this.whatsappQueue.enqueueSendText(message.id);

    const queuedMessage = await this.messageRepository.markAsQueued(message.id);

    return {
      id: queuedMessage.id,
      recipient: queuedMessage.recipient,
      status: queuedMessage.status,
    };
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

  private async enqueueMessage(messageId: string) {
    try {
      await this.whatsappQueue.enqueueSendText(messageId);
    } catch {
      await this.messageRepository.markAsFailed(
        messageId,
        'QUEUE_UNAVAILABLE',
        'Failed to enqueue WhatsApp message',
      );

      throw new ServiceUnavailableException({
        code: 'QUEUE_UNAVAILABLE',
        message: 'Message queue is currently unavailable',
      });
    }

    return this.messageRepository.markAsQueued(messageId);
  }
}
