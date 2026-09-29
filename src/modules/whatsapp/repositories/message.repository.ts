import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../database/prisma.service';
import {
  MessageDirection,
  MessageStatus,
} from '../../../generated/prisma/client';
import { Prisma } from '../../../generated/prisma/client';
import { IdempotentMessageResult } from '../types/whatsapp-message.types';

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  createOutbound(recipient: string, content: string, idempotencyKey?: string) {
    return this.prisma.message.create({
      data: {
        recipient,
        content,
        idempotencyKey,
        direction: MessageDirection.OUTBOUND,
        status: MessageStatus.PENDING,
      },
    });
  }

  findByIdempotencyKey(idempotencyKey: string) {
    return this.prisma.message.findUnique({
      where: {
        idempotencyKey,
      },
    });
  }

  async createOutboundIdempotent(
    recipient: string,
    content: string,
    idempotencyKey: string,
  ): Promise<IdempotentMessageResult> {
    try {
      const message = await this.createOutbound(
        recipient,
        content,
        idempotencyKey,
      );

      return {
        message,
        created: true,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await this.findByIdempotencyKey(idempotencyKey);

        if (existing) {
          return {
            message: existing,
            created: false,
          };
        }
      }

      throw error;
    }
  }

  markAsQueued(id: string) {
    return this.prisma.message.update({
      where: { id },
      data: {
        status: MessageStatus.QUEUED,
      },
    });
  }

  markAsProcessing(id: string) {
    return this.prisma.message.update({
      where: { id },
      data: {
        status: MessageStatus.PROCESSING,
      },
    });
  }

  markAsSent(id: string, providerMessageId: string) {
    return this.prisma.message.update({
      where: { id },
      data: {
        providerMessageId,
        status: MessageStatus.SENT,
        sentAt: new Date(),
      },
    });
  }

  markAsFailed(id: string, errorCode?: string, errorMessage?: string) {
    return this.prisma.message.update({
      where: { id },
      data: {
        status: MessageStatus.FAILED,
        errorCode,
        errorMessage,
        failedAt: new Date(),
      },
    });
  }

  findById(id: string) {
    return this.prisma.message.findUnique({
      where: { id },
    });
  }

  async findByProviderMessageId(providerMessageId: string) {
    return this.prisma.message.findUnique({
      where: {
        providerMessageId,
      },
    });
  }

  async markAsDelivered(id: string) {
    return this.prisma.message.update({
      where: { id },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    });
  }
}
