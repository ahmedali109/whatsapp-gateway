import type { Message } from '../../../generated/prisma/client';

export interface ProviderSendTextResult {
  messageId: string;
  recipient: string;
  status: string;
}

export interface SendTextResult {
  id: string;
  recipient: string;
  status: string;
}

export interface IdempotentMessageResult {
  message: Message;
  created: boolean;
}
