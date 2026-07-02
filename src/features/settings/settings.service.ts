import { Inject, Injectable } from '@nestjs/common';
import {
  VIVERO_CONFIG_REPOSITORY,
  ViveroConfigTypeOrmEntity,
} from 'src/database/entities/vivero-config.typeorm.entity';
import { Repository } from 'typeorm';

import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @Inject(VIVERO_CONFIG_REPOSITORY)
    private readonly configRepository: Repository<ViveroConfigTypeOrmEntity>,
  ) {}

  /**
   * Devuelve la configuración del negocio (fila única). Si aún no existe, crea
   * una por defecto para que el front y el ticket siempre tengan algo que leer.
   */
  async get(): Promise<ViveroConfigTypeOrmEntity> {
    const existing = await this.configRepository.findOne({
      order: { id: 'ASC' },
      where: {},
    });
    if (existing) return existing;

    const created = this.configRepository.create({
      businessName: 'Mi Vivero',
      ruc: null,
      phone: null,
      address: null,
      email: null,
    });
    return this.configRepository.save(created);
  }

  /** Actualiza la configuración del negocio (sobre la fila única). */
  async update(data: UpdateSettingsDto): Promise<ViveroConfigTypeOrmEntity> {
    const config = await this.get();
    config.businessName = data.businessName;
    config.ruc = data.ruc ?? null;
    config.phone = data.phone ?? null;
    config.address = data.address ?? null;
    config.email = data.email ?? null;
    return this.configRepository.save(config);
  }
}
