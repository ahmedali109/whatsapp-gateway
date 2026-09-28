import type { ProviderSendTextResult } from '../types/whatsapp-message.types';

export const WHATSAPP_PROVIDER = Symbol('WHATSAPP_PROVIDER');

export interface WhatsAppProvider {
  sendText(number: string, text: string): Promise<ProviderSendTextResult>;
}
