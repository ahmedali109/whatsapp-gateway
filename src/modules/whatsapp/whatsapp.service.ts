import { Inject, Injectable } from '@nestjs/common';

import {
  WHATSAPP_PROVIDER,
  type WhatsAppProvider,
} from './providers/whatsapp-provider.interface';
import type { SendTextResult } from './types/whatsapp-message.types';

@Injectable()
export class WhatsappService {
  constructor(
    @Inject(WHATSAPP_PROVIDER)
    private readonly provider: WhatsAppProvider,
  ) {}

  async sendText(number: string, text: string): Promise<SendTextResult> {
    return this.provider.sendText(number, text);
  }
}
