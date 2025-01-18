import { z } from 'zod';

export enum PrimaryStorageState {
  Unknown = -1,
  OK = 0,
  SdCardFull = 1,
  SdCardRemoved = 2,
  SdCardFormatError = 3,
  SdCardBusy = 4,
  SdCardSwapped = 8,
}

export const StatusSchema = z.object({
  '8': z.coerce.boolean(),
  '33': z.nativeEnum(PrimaryStorageState),
});
export type Status = z.infer<typeof StatusSchema>;

export const StateResponseSchema = z
  .object({
    status: StatusSchema,
  })
  .transform((data) => {
    const transformedStatus = Object.fromEntries(
      Object.entries(data.status).map(([key, value]) => {
        const settingsKey = SettingsMap.get(parseInt(key));
        return settingsKey ? [settingsKey, value] : [key, value];
      })
    );

    return { ...data, status: transformedStatus };
  });
export type StateResponse = z.infer<typeof StateResponseSchema>;

export enum SettingsKey {
  IsBusy = 'isBusy',
  PrimaryStorageState = 'primaryStorageState',
}

const SettingsMap = new Map<number, string>([
  [8, SettingsKey.IsBusy],
  [33, SettingsKey.PrimaryStorageState],
]);
