import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

import type { WhatsAppProvider } from '../providers/whatsapp-provider.interface';
import { WHATSAPP_PROVIDER } from '../providers/whatsapp-provider.interface';
import { MessageRepository } from '../repositories/message.repository';
import { WHATSAPP_JOBS, WHATSAPP_QUEUE } from './whatsapp-queue.constants';
import type { SendTextJobData } from './whatsapp-job.types';
import { Inject } from '@nestjs/common';

@Processor(WHATSAPP_QUEUE, {
  concurrency: 5,
})
export class WhatsappProcessor extends WorkerHost {
  private readonly logger = new Logger(WhatsappProcessor.name);

  constructor(
    private readonly messageRepository: MessageRepository,

    @Inject(WHATSAPP_PROVIDER)
    private readonly provider: WhatsAppProvider,
  ) {
    super();
  }

  async process(job: Job<SendTextJobData>): Promise<void> {
    if (job.name !== WHATSAPP_JOBS.SEND_TEXT) {
      throw new Error(`Unsupported WhatsApp job: ${job.name}`);
    }

    const message = await this.messageRepository.findById(job.data.messageId);

    if (!message) {
      throw new Error(`Message ${job.data.messageId} not found`);
    }

    await this.messageRepository.markAsProcessing(message.id);

    const result = await this.provider.sendText(
      message.recipient,
      message.content,
    );

    await this.messageRepository.markAsSent(message.id, result.messageId);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<SendTextJobData>) {
    this.logger.log(
      `WhatsApp job ${job.id} completed for message ${job.data.messageId}`,
    );
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<SendTextJobData> | undefined, error: Error) {
    if (!job) {
      this.logger.error(`Unknown WhatsApp job failed: ${error.message}`);
      return;
    }

    const maxAttempts = job.opts.attempts ?? 1;

    this.logger.warn(
      `WhatsApp job ${job.id} failed ` +
        `(attempt ${job.attemptsMade}/${maxAttempts}): ${error.message}`,
    );

    if (job.attemptsMade >= maxAttempts) {
      await this.messageRepository.markAsFailed(
        job.data.messageId,
        'WHATSAPP_PROVIDER_UNAVAILABLE',
        'WhatsApp message failed after all retry attempts',
      );

      this.logger.error(
        `WhatsApp message ${job.data.messageId} permanently failed after ${maxAttempts} attempts`,
      );
    }
  }
}
