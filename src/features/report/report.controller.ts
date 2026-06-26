import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/features/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/features/auth/guards/roles.guard';

import { ReportService } from './report.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  constructor(private readonly service: ReportService) {}

  /** KPIs y datos de los gráficos del dashboard. */
  @Get('dashboard')
  getDashboard() {
    return this.service.getDashboard();
  }

  /** Reporte de ventas, con filtro de fechas opcional (?startDate&endDate). */
  @Get('sales')
  getSales(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getSalesReport(startDate, endDate);
  }

  /** Reporte de inventario (todos los productos con su estado de stock). */
  @Get('inventory')
  getInventory() {
    return this.service.getInventoryReport();
  }

  /** Reporte de clientes. */
  @Get('clients')
  getClients() {
    return this.service.getClientsReport();
  }
}
