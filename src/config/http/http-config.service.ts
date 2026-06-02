import { Injectable } from '@nestjs/common';

@Injectable()
export class HttpConfigService {
  get GLOBAL_PREFIX(): string {
    return 'api';
  }
}
