import https from 'node:https';
import axios, { type AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

import { HardwareInfo, HardwareInfoSchema, LastCapturedMedia, LastCapturedMediaSchema, ShutterMode, Version, VersionSchema } from './types';
import { AvailablePresets, AvailablePresetsSchema, PresetGroupEnum } from './types/Preset';
import { StateResponse, StateResponseSchema } from './types/State';

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
        Authorization: `Basic ${token}`,
      },
      httpsAgent,
    });

    axiosRetry(this.api, { retries: 3, retryDelay: axiosRetry.exponentialDelay, shouldResetTimeout: true });
  }

  private api: AxiosInstance;

  /**
   * Query
   */
  public async getLastCapturedMedia(): Promise<LastCapturedMedia> {
    const response = await this.api.get<LastCapturedMedia>('/gopro/media/last_captured');

    return LastCapturedMediaSchema.parse(response.data);
  }

  public async getVersion(): Promise<Version> {
    const response = await this.api.get<Version>('/gopro/version');

    return VersionSchema.parse(response.data);
  }

  public async getHardwareInfo(): Promise<HardwareInfo> {
    const response = await this.api.get<HardwareInfo>('/gopro/camera/info');

    return HardwareInfoSchema.parse(response.data);
  }

  public async getPresets(): Promise<AvailablePresets> {
    const response = await this.api.get<AvailablePresets>('/gopro/camera/presets/get');

    return AvailablePresetsSchema.parse(response.data);
  }

  public async getState(): Promise<StateResponse> {
    const response = await this.api.get<StateResponse>('/gopro/camera/state');

    return StateResponseSchema.parse(response.data);
  }

  /**
   * Preset
   */
  public async setPresetGroup(id: PresetGroupEnum): Promise<void> {
    await this.api.get('/gopro/camera/presets/set_group', { params: { id } });
  }

  /**
   * Media
   */
  public async downloadMedia(directory: string, filename: string): Promise<Buffer> {
    const response = await this.api.get<ArrayBuffer>(`/videos/DCIM/${encodeURIComponent(directory)}/${encodeURIComponent(filename)}`, {
      headers: {
        Accept: 'application/octet-stream',
      },
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    return Buffer.from(response.data);
  }

  /**
   * Control
   */
  public async setShutter(mode: ShutterMode): Promise<void> {
    await this.api.get(`/gopro/camera/shutter/${mode}`);
  }

  public async keepAlive(): Promise<void> {
    await this.api.get('/gopro/camera/keep_alive');
  }

  static async build(config: GoProHttpClientConfig): Promise<GoProHttpClient> {
    const instance = new GoProHttpClient(config);
    return instance;
  }
}

export { GoProHttpClient };
