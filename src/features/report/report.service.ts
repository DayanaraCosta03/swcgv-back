import { Inject, Injectable } from '@nestjs/common';
import { ClientTypeOrmEntity } from 'src/database/entities/client.typeorm.entity';
import { ProductTypeOrmEntity } from 'src/database/entities/product.typeorm.entity';
import { SaleItemTypeOrmEntity } from 'src/database/entities/sale-item.typeorm.entity';
import { SaleTypeOrmEntity } from 'src/database/entities/sale.typeorm.entity';
import { MAIN_DATA_SOURCE } from 'src/database/database.provider';
import { DataSource, LessThanOrEqual } from 'typeorm';

/** Mismo umbral que usa el módulo de inventario para "stock bajo". */
const LOW_STOCK_THRESHOLD = 10;

type StockStatus = 'SIN_STOCK' | 'STOCK_BAJO' | 'EN_STOCK';

const MONTHS_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

const resolveStatus = (stock: number): StockStatus => {
  if (stock <= 0) return 'SIN_STOCK';
  if (stock <= LOW_STOCK_THRESHOLD) return 'STOCK_BAJO';
  return 'EN_STOCK';
};

@Injectable()
export class ReportService {
  constructor(
    @Inject(MAIN_DATA_SOURCE)
    private readonly dataSource: DataSource,
  ) {}

  private get sales() {
    return this.dataSource.getRepository(SaleTypeOrmEntity);
  }
  private get saleItems() {
    return this.dataSource.getRepository(SaleItemTypeOrmEntity);
  }
  private get products() {
    return this.dataSource.getRepository(ProductTypeOrmEntity);
  }
  private get clients() {
    return this.dataSource.getRepository(ClientTypeOrmEntity);
  }

  /* ----------------------------------------------------------------------- */
  /* Dashboard: KPIs + datos para los gráficos.                              */
  /* ----------------------------------------------------------------------- */
  async getDashboard() {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // --- KPIs de ventas (total / hoy / mes) ---
    const totals = await this.sales
      .createQueryBuilder('s')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(s.totalAmount), 0)', 'revenue')
      .getRawOne<{ count: string; revenue: string }>();

    const today = await this.sales
      .createQueryBuilder('s')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(s.totalAmount), 0)', 'revenue')
      .where('s.saleDate >= :start', { start: startOfToday })
      .getRawOne<{ count: string; revenue: string }>();

    const month = await this.sales
      .createQueryBuilder('s')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(s.totalAmount), 0)', 'revenue')
      .where('s.saleDate >= :start', { start: startOfMonth })
      .getRawOne<{ count: string; revenue: string }>();

    // --- Inventario (mismos contadores que /products/stats) ---
    const [invTotal, outOfStock, lowStock, inStock] = await Promise.all([
      this.products.count(),
      this.products.count({ where: { stock: 0 } }),
      this.products
        .createQueryBuilder('p')
        .where('p.stock BETWEEN 1 AND :t', { t: LOW_STOCK_THRESHOLD })
        .getCount(),
      this.products
        .createQueryBuilder('p')
        .where('p.stock > :t', { t: LOW_STOCK_THRESHOLD })
        .getCount(),
    ]);

    const clientsTotal = await this.clients.count();

    // --- Ingresos por mes (últimos 6 meses) ---
    const byMonthRaw = await this.sales
      .createQueryBuilder('s')
      .select("to_char(s.saleDate, 'YYYY-MM')", 'ym')
      .addSelect('COALESCE(SUM(s.totalAmount), 0)', 'revenue')
      .where('s.saleDate >= :start', { start: sixMonthsAgo })
      .groupBy("to_char(s.saleDate, 'YYYY-MM')")
      .orderBy('ym', 'ASC')
      .getRawMany<{ ym: string; revenue: string }>();

    const salesByMonth = byMonthRaw.map((r) => {
      const [year, m] = r.ym.split('-');
      return {
        month: `${MONTHS_ES[Number(m) - 1]} ${year}`,
        revenue: Number(r.revenue),
      };
    });

    // --- Ventas por método de pago ---
    const byPaymentRaw = await this.sales
      .createQueryBuilder('s')
      .select('s.paymentMethod', 'method')
      .addSelect('COALESCE(SUM(s.totalAmount), 0)', 'revenue')
      .groupBy('s.paymentMethod')
      .getRawMany<{ method: string; revenue: string }>();

    const salesByPaymentMethod = byPaymentRaw.map((r) => ({
      method: r.method,
      revenue: Number(r.revenue),
    }));

    // --- Productos más vendidos (top 5 por unidades) ---
    const topRaw = await this.saleItems
      .createQueryBuilder('si')
      .leftJoin('si.product', 'p')
      .select('p.id', 'id')
      .addSelect('p.name', 'name')
      .addSelect('COALESCE(SUM(si.quantity), 0)', 'quantity')
      .groupBy('p.id')
      .addGroupBy('p.name')
      .orderBy('quantity', 'DESC')
      .limit(5)
      .getRawMany<{ id: number; name: string; quantity: string }>();

    const topProducts = topRaw
      .filter((r) => r.name)
      .map((r) => ({
        id: r.id,
        name: r.name,
        quantity: Number(r.quantity),
      }));

    // --- Alertas de stock (stock bajo / sin stock) ---
    const lowStockEntities = await this.products.find({
      where: { stock: LessThanOrEqual(LOW_STOCK_THRESHOLD) },
      relations: { category: true },
      order: { stock: 'ASC' },
    });

    const lowStockProducts = lowStockEntities.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category?.name ?? '—',
      stock: p.stock,
      status: resolveStatus(p.stock),
    }));

    return {
      sales: {
        count: Number(totals?.count ?? 0),
        revenue: Number(totals?.revenue ?? 0),
        todayCount: Number(today?.count ?? 0),
        todayRevenue: Number(today?.revenue ?? 0),
        monthCount: Number(month?.count ?? 0),
        monthRevenue: Number(month?.revenue ?? 0),
      },
      inventory: {
        total: invTotal,
        inStock,
        lowStock,
        outOfStock,
      },
      clients: { total: clientsTotal },
      salesByMonth,
      salesByPaymentMethod,
      topProducts,
      lowStockProducts,
    };
  }

  /* ----------------------------------------------------------------------- */
  /* Reporte de ventas (con filtro de fechas opcional).                      */
  /* ----------------------------------------------------------------------- */
  async getSalesReport(startDate?: string, endDate?: string) {
    const qb = this.sales
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.client', 'client')
      .orderBy('s.saleDate', 'DESC');

    if (startDate) {
      qb.andWhere('s.saleDate >= :startDate', { startDate });
    }
    if (endDate) {
      // Incluir todo el día final.
      qb.andWhere('s.saleDate <= :endDate', { endDate: `${endDate} 23:59:59` });
    }

    const rows = await qb.getMany();

    return rows.map((s) => ({
      id: s.id,
      saleDate: s.saleDate,
      client: s.client?.name ?? 'Sin cliente',
      paymentMethod: s.paymentMethod,
      documentType: s.documentType,
      total: Number(s.totalAmount),
    }));
  }

  /* ----------------------------------------------------------------------- */
  /* Reporte de inventario.                                                   */
  /* ----------------------------------------------------------------------- */
  async getInventoryReport() {
    const products = await this.products.find({
      relations: { category: true },
      order: { name: 'ASC' },
    });

    const items = products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category?.name ?? '—',
      price: Number(p.price),
      stock: p.stock,
      status: resolveStatus(p.stock),
    }));

    return { items };
  }

  /* ----------------------------------------------------------------------- */
  /* Reporte de clientes.                                                     */
  /* ----------------------------------------------------------------------- */
  async getClientsReport() {
    const clients = await this.clients.find({ order: { name: 'ASC' } });

    return clients.map((c) => ({
      id: c.id,
      name: c.name,
      dni: c.dni,
      phoneNumber: c.phoneNumber,
      email: c.email,
      address: c.address,
      isActive: c.isActive,
    }));
  }
}
