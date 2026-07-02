import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { Roles } from 'src/features/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/features/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/features/auth/guards/roles.guard';

import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  /** Configuración del negocio. Admin y vendedor (el ticket la necesita). */
  @Get()
  get() {
    return this.service.get();
  }

  /** Actualizar la configuración. Solo administradores. */
  @Put()
  @Roles('admin')
  update(@Body() data: UpdateSettingsDto) {
    return this.service.update(data);
  }
}
