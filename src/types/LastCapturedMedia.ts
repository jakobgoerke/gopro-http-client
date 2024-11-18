import { z } from 'zod';

export const LastCapturedMediaSchema = z.object({
  file: z.string(),
  folder: z.string(),
});
export type LastCapturedMedia = z.infer<typeof LastCapturedMediaSchema>;
