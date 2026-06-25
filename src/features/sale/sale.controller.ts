import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/features/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/features/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/features/auth/guards/roles.guard';

import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySaleDto } from './dto/query-sale.dto';
import { SaleService } from './sale.service';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SaleController {
  constructor(private readonly service: SaleService) {}

  /** Historial de ventas. */
  @Get()
  findAll(@Query() query: QuerySaleDto) {
    return this.service.findAll(query);
  }

  /** Detalle de una venta. */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /** Registrar una nueva venta (descuenta stock automáticamente). */
  @Post()
  create(@Body() data: CreateSaleDto) {
    return this.service.create(data);
  }

  /** Anular una venta y devolver el stock. Solo administradores. */
  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
