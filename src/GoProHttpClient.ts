import https from 'https';
import axios, { type AxiosInstance } from 'axios';

import { HardwareInfo, HardwareInfoSchema, LastCapturedMedia, LastCapturedMediaSchema, ShutterMode, Version, VersionSchema } from './types';
import { AvailablePresets, AvailablePresetsSchema, PresetGroupEnum } from './types/Preset';
import { StateRespons, StateResponseSchema } from './types/State';

export enum Url {
  Version = '/gopro/version',
  HardwareInfo = '/gopro/camera/info',
  LastCapturedMedia = '/gopro/media/last_captured',
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
      baseURL: `https://${config.ip}/`,
      headers: {
        Authorization: 'Basic ' + token,
      },
      httpsAgent,
    });
  }

  private api: AxiosInstance;

  // query
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
    const response = await this.api.get<AvailablePresets>('/gopro/camera/presets/get');

    return AvailablePresetsSchema.parse(response.data);
  }

  public async getCameraState(): Promise<any> {
    const response = await this.api.get<StateRespons>('/gopro/camera/state');

    return StateResponseSchema.parse(response.data);
  }

  // presets
  public async setPresetGroup(id: PresetGroupEnum): Promise<void> {
    await this.api.get('/gopro/camera/presets/set_group', { params: { id } });
  }

  // media
  public async downloadMedia(directory: string, filename: string): Promise<Buffer> {
    const response = await this.api.get<ArrayBuffer>(`/videos/DCIM/${encodeURIComponent(directory)}/${encodeURIComponent(filename)}`, {
      headers: {
        Accept: 'application/octet-stream',
      },
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data);
  }

  // control
  public async setShutter(mode: ShutterMode): Promise<void> {
    await this.api.get(`/gopro/camera/shutter/${mode}`);
  }

  static async build(config: GoProHttpClientConfig): Promise<GoProHttpClient> {
    const instance = new GoProHttpClient(config);
    return instance;
  }
}

export { GoProHttpClient, PresetGroupEnum };
