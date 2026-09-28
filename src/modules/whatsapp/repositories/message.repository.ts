import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../database/prisma.service';
import {
  MessageDirection,
  MessageStatus,
} from '../../../generated/prisma/client';

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  createOutbound(recipient: string, content: string) {
    return this.prisma.message.create({
      data: {
        recipient,
        content,
        direction: MessageDirection.OUTBOUND,
        status: MessageStatus.PENDING,
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
}
