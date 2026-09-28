import { z } from 'zod';

export const sendTextSchema = z.object({
  number: z.string().regex(/^\d{8,15}$/, 'Invalid phone number'),

  text: z.string().trim().min(1).max(4096),
});

export type SendTextDto = z.infer<typeof sendTextSchema>;
