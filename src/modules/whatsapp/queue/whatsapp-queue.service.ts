import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

import type { EnvironmentVariables } from '../../../config/env.types';
import { WHATSAPP_JOBS, WHATSAPP_QUEUE } from './whatsapp-queue.constants';
import type { SendTextJobData } from './whatsapp-job.types';

@Injectable()
export class WhatsappQueueService implements OnModuleDestroy {
  private readonly queue: Queue<SendTextJobData>;

  private readonly redisHost: string;
  private readonly redisPort: number;
  private readonly redisDb: number;

  constructor(configService: ConfigService<EnvironmentVariables, true>) {
    this.redisHost = configService.getOrThrow('REDIS_HOST');

    this.redisPort = configService.getOrThrow('REDIS_PORT');

    this.redisDb = configService.getOrThrow('REDIS_DB');

    this.queue = new Queue<SendTextJobData>(WHATSAPP_QUEUE, {
      connection: {
        host: this.redisHost,
        port: this.redisPort,
        db: this.redisDb,
      },
    });
  }

  async isAvailable(): Promise<boolean> {
    const redis = new Redis({
      host: this.redisHost,
      port: this.redisPort,
      db: this.redisDb,

      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 0,
      connectTimeout: 1000,

      retryStrategy: () => null,
    });

    // Prevent Redis EventEmitter errors
    // from becoming unhandled errors.
    redis.on('error', () => undefined);

    try {
      await redis.connect();

      const result = await redis.ping();

      return result === 'PONG';
    } catch {
      return false;
    } finally {
      redis.disconnect();
    }
  }

  async enqueueSendText(messageId: string) {
    return this.queue.add(
      WHATSAPP_JOBS.SEND_TEXT,
      {
        messageId,
      },
      {
        jobId: messageId,

        attempts: 6,

        backoff: {
          type: 'exponential',
          delay: 5000,
        },

        removeOnComplete: {
          age: 3600,
          count: 1000,
        },

        removeOnFail: {
          age: 24 * 3600,
          count: 5000,
        },
      },
    );
  }

  async onModuleDestroy() {
    await this.queue.close();
  }
}
