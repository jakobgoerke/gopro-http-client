import { z } from 'zod';

export const HardwareInfoSchema = z.object({
  ap_mac_addr: z.string(),
  ap_ssid: z.string(),
  firmware_version: z.string(),
  model_name: z.string(),
  model_number: z.number(),
  serial_number: z.string(),
});
export type HardwareInfo = z.infer<typeof HardwareInfoSchema>;
