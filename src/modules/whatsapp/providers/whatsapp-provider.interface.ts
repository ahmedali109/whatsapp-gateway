import type { SendTextResult } from '../types/whatsapp-message.types';

export interface WhatsAppProvider {
  sendText(number: string, text: string): Promise<SendTextResult>;
}

export const WHATSAPP_PROVIDER = Symbol('WHATSAPP_PROVIDER');
