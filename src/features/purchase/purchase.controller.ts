import {
  Body,
  Controller,
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

import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { QueryPurchaseDto } from './dto/query-purchase.dto';
import { PurchaseService } from './purchase.service';

/** Compras a proveedores. Solo administradores. */
@Controller('purchases')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PurchaseController {
  constructor(private readonly service: PurchaseService) {}

  /** Historial de compras. */
  @Get()
  findAll(@Query() query: QueryPurchaseDto) {
    return this.service.findAll(query);
  }

  /** Detalle de una compra. */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /** Registrar una compra (suma stock y actualiza costo). */
  @Post()
  create(@Body() data: CreatePurchaseDto) {
    return this.service.create(data);
  }
}
