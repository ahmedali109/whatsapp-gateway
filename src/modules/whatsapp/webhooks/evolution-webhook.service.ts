import { Injectable, Logger } from '@nestjs/common';

import { MessageRepository } from '../repositories/message.repository';
import { evolutionMessageUpdateWebhookSchema } from './evolution-webhook.schema';

@Injectable()
export class EvolutionWebhookService {
  private readonly logger = new Logger(EvolutionWebhookService.name);

  constructor(private readonly messageRepository: MessageRepository) {}

  async handle(payload: unknown) {
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('event' in payload)
    ) {
      return { received: true };
    }

    const event = String(payload.event);

    this.logger.debug(`Evolution webhook received: ${event}`);

    if (event !== 'messages.update') {
      return { received: true };
    }

    const result = evolutionMessageUpdateWebhookSchema.safeParse(payload);

    if (!result.success) {
      this.logger.warn('Invalid messages.update webhook payload');

      return { received: true };
    }

    const { keyId, status, fromMe } = result.data.data;

    if (!fromMe) {
      return { received: true };
    }

    const message = await this.messageRepository.findByProviderMessageId(keyId);

    if (!message) {
      this.logger.debug(
        `Ignoring update for unknown provider message ${keyId}`,
      );

      return { received: true };
    }

    if (status === 'DELIVERY_ACK') {
      await this.messageRepository.markAsDelivered(message.id);

      this.logger.debug(`Message ${message.id} marked as DELIVERED`);
    }

    return {
      received: true,
    };
  }
}
