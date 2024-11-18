import https from 'https';
import axios, { type AxiosInstance } from 'axios';

import { HardwareInfo, HardwareInfoSchema, LastCapturedMedia, LastCapturedMediaSchema, Version, VersionSchema } from './types';
import { AvailablePresets, AvailablePresetsSchema, PresetGroupEnum } from './types/Preset';

export enum Url {
  Version = '/version',
  HardwareInfo = '/camera/info',
  LastCapturedMedia = '/media/last_captured',
}

interface GoProHttpClientConfig {
  ip: string;
  username: string;
  password: string;
}

class GoProHttpClient {
  constructor(config: GoProHttpClientConfig) {
    const token = Buffer.from(`${config.username}:${config.password}`).toString('base64');

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    this.api = axios.create({
      timeout: 5000,
      baseURL: `https://${config.ip}/gopro`,
      headers: {
        Authorization: 'Basic ' + token,
      },
      httpsAgent,
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

  public async getPresets(): Promise<AvailablePresets> {
    const response = await this.api.get<AvailablePresets>('/camera/presets/get');

    return AvailablePresetsSchema.parse(response.data);
  }

  public async setPresetGroup(id: PresetGroupEnum): Promise<void> {
    await this.api.get('/camera/presets/set_group', { params: { id } });
  }

  static async build(config: GoProHttpClientConfig): Promise<GoProHttpClient> {
    const instance = new GoProHttpClient(config);
    return instance;
  }
}

export { GoProHttpClient, PresetGroupEnum };
