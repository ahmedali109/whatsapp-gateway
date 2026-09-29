import { z } from 'zod';

export const evolutionMessageUpdateDataSchema = z.object({
  keyId: z.string().min(1),
  remoteJid: z.string().min(1),
  fromMe: z.boolean(),
  status: z.string().min(1),
  instanceId: z.string().min(1),
  messageId: z.string().optional(),
});

export const evolutionMessageUpdateWebhookSchema = z.object({
  event: z.literal('messages.update'),
  instance: z.string().min(1),
  data: evolutionMessageUpdateDataSchema,
});

export type EvolutionMessageUpdateWebhook = z.infer<
  typeof evolutionMessageUpdateWebhookSchema
>;
