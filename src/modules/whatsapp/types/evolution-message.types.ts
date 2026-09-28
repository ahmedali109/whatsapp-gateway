export interface EvolutionSendTextResponse {
  key: EvolutionMessageKey;
  pushName?: string;
  status: EvolutionMessageStatus;
  message: EvolutionMessageContent;
  contextInfo?: EvolutionContextInfo;
  messageType: string;
  messageTimestamp: number;
  instanceId: string;
  source: string;
}

export interface EvolutionMessageKey {
  remoteJid: string;
  fromMe: boolean;
  id: string;
}

export interface EvolutionMessageContent {
  conversation?: string;
}

export interface EvolutionContextInfo {
  mentionedJid?: string[];
  groupMentions?: unknown[];
  ephemeralSettingTimestamp?: EvolutionLong;
  disappearingMode?: {
    initiator: number;
  };
}

export interface EvolutionLong {
  low: number;
  high: number;
  unsigned: boolean;
}

export type EvolutionMessageStatus =
  'PENDING' | 'SERVER_ACK' | 'DELIVERY_ACK' | 'READ' | 'PLAYED' | 'ERROR';
