import { ConfigService } from '@nestjs/config';

export abstract class BaseConfigService {
  constructor(protected readonly configService: ConfigService) {}

  protected getString(key: string): string {
    const value: unknown = this.configService.getOrThrow(key, { infer: true });

    if (typeof value !== 'string') {
      throw new Error(`Config key "${key}" must be a string`);
    }

    return value;
  }

  protected getNumber(key: string): number {
    const value: unknown = this.configService.getOrThrow(key, { infer: true });

    if (typeof value !== 'number') {
      throw new Error(`Config key "${key}" must be a number`);
    }

    return value;
  }

  protected getBoolean(key: string): boolean {
    const value: unknown = this.configService.getOrThrow(key, { infer: true });

    if (typeof value !== 'boolean') {
      throw new Error(`Config key "${key}" must be a boolean`);
    }

    return value;
  }

  protected getStringArray(key: string, separator = ','): string[] {
    const value: unknown = this.configService.getOrThrow(key, { infer: true });

    if (typeof value !== 'string') {
      throw new Error(`Config key "${key}" must be a string`);
    }

    return value
      .split(separator)
      .map((v) => v.trim())
      .filter(Boolean);
  }
}
