export interface ProviderSendTextResult {
  messageId: string;
  recipient: string;
  status: string;
}

export interface SendTextResult {
  id: string;
  providerMessageId: string;
  recipient: string;
  status: string;
}
