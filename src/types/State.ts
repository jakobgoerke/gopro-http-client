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

export const StateResponseSchema = z.object({
  status: StatusSchema.transform((data) => {
    const x = {};

    Object.keys(data).map((key) => {
      const settingsKey = SettingsMap.get(parseInt(key));
      if (settingsKey) {
        // @ts-ignore
        x[settingsKey] = data[key];
      }
    });

    return x;
  }),
});
export type StateRespons = z.infer<typeof StateResponseSchema>;

export enum SettingsKey {
  IsBusy = 'isBusy',
  PrimaryStorageState = 'primaryStorageState',
}

const SettingsMap = new Map<number, string>([
  [8, SettingsKey.IsBusy],
  [33, SettingsKey.PrimaryStorageState],
]);
