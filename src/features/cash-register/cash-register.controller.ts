import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/features/auth/decorators/current-user.decorator';
import { Roles } from 'src/features/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/features/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/features/auth/guards/roles.guard';

import { CashRegisterService } from './cash-register.service';
import { CloseCashRegisterDto } from './dto/close-cash-register.dto';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto';
import { QueryCashRegisterDto } from './dto/query-cash-register.dto';

@Controller('cash-register')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CashRegisterController {
  constructor(private readonly service: CashRegisterService) {}

  /** Abrir caja con monto inicial. Admin y vendedor. */
  @Post('open')
  open(@CurrentUser('id') userId: number, @Body() data: OpenCashRegisterDto) {
    return this.service.open(userId, data);
  }

  /** Cerrar la caja abierta y calcular el arqueo. Admin y vendedor. */
  @Post('close')
  close(@CurrentUser('id') userId: number, @Body() data: CloseCashRegisterDto) {
    return this.service.close(userId, data);
  }

  /** Caja abierta del usuario actual (o null). Admin y vendedor. */
  @Get('current')
  current(@CurrentUser('id') userId: number) {
    return this.service.current(userId);
  }

  /** Historial de todas las cajas. Solo administradores. */
  @Get()
  @Roles('admin')
  findAll(@Query() query: QueryCashRegisterDto) {
    return this.service.findAll(query);
  }
}
