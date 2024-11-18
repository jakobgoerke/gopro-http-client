import axios, { type AxiosInstance } from 'axios';

import { HardwareInfo, HardwareInfoSchema, LastCapturedMedia, LastCapturedMediaSchema, Version, VersionSchema } from './types';

export enum Url {
  Version = '/version',
  HardwareInfo = '/camera/info',
  LastCapturedMedia = '/media/last_captured',
}

class GoProHttpClient {
  constructor(ip: string) {
    this.api = axios.create({
      timeout: 5000,
      baseURL: `http://${ip}/gopro`,
    });
  }

  private api: AxiosInstance;

  public async getLastCapturedMedia(): Promise<LastCapturedMedia> {
    const response = await this.api.get<LastCapturedMedia>(Url.LastCapturedMedia);

    return LastCapturedMediaSchema.parse(response.data);
  }

  public async getVersion(): Promise<Version> {
    const response = await this.api.get<Version>(Url.Version);

    return VersionSchema.parse(response.data);
  }

  public async getHardwareInfo(): Promise<HardwareInfo> {
    const response = await this.api.get<HardwareInfo>(Url.HardwareInfo);

    return HardwareInfoSchema.parse(response.data);
  }

  static async build(ip: string): Promise<GoProHttpClient> {
    const instance = new GoProHttpClient(ip);
    return instance;
  }
}

export { GoProHttpClient };
export type { HardwareInfo, LastCapturedMedia, Version };
