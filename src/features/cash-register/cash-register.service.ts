import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  CASH_REGISTER_REPOSITORY,
  CashRegisterTypeOrmEntity,
} from 'src/database/entities/cash-register.typeorm.entity';
import {
  SALE_REPOSITORY,
  SaleTypeOrmEntity,
} from 'src/database/entities/sale.typeorm.entity';
import { Repository } from 'typeorm';

import { CloseCashRegisterDto } from './dto/close-cash-register.dto';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto';
import { QueryCashRegisterDto } from './dto/query-cash-register.dto';

@Injectable()
export class CashRegisterService {
  constructor(
    @Inject(CASH_REGISTER_REPOSITORY)
    private readonly cashRegisterRepository: Repository<CashRegisterTypeOrmEntity>,

    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: Repository<SaleTypeOrmEntity>,
  ) {}

  /**
   * Abre una caja para el usuario. Falla si ya tiene una caja abierta
   * (regla: una sola caja abierta por usuario a la vez).
   */
  async open(userId: number, data: OpenCashRegisterDto) {
    const existing = await this.findOpenByUser(userId);
    if (existing) {
      throw new ConflictException('Ya tienes una caja abierta');
    }

    const cashRegister = this.cashRegisterRepository.create({
      userId,
      openedAt: new Date(),
      initialAmount: data.initialAmount,
      status: 'OPEN',
    });

    return this.cashRegisterRepository.save(cashRegister);
  }

  /**
   * Cierra la caja abierta del usuario y calcula el arqueo:
   *   expectedAmount = initialAmount + ventas en EFECTIVO desde la apertura
   *   difference     = finalAmount - expectedAmount   (negativo = faltante)
   */
  async close(userId: number, data: CloseCashRegisterDto) {
    const cashRegister = await this.findOpenByUser(userId);
    if (!cashRegister) {
      throw new BadRequestException('No tienes una caja abierta para cerrar');
    }

    const closedAt = new Date();
    const cashSales = await this.sumCashSales(cashRegister.openedAt, closedAt);
    const expectedAmount = Number(cashRegister.initialAmount) + cashSales;
    const difference = data.finalAmount - expectedAmount;

    cashRegister.closedAt = closedAt;
    cashRegister.finalAmount = data.finalAmount;
    cashRegister.expectedAmount = expectedAmount;
    cashRegister.difference = difference;
    cashRegister.status = 'CLOSED';

    return this.cashRegisterRepository.save(cashRegister);
  }

  /** Caja abierta del usuario (o null si no tiene ninguna). */
  current(userId: number) {
    return this.findOpenByUser(userId);
  }

  /** Historial de cajas (solo admin), paginado. */
  async findAll(query: QueryCashRegisterDto) {
    const [items, total] = await this.cashRegisterRepository.findAndCount({
      order: { openedAt: query.order },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      pages: Math.ceil(total / query.limit),
    };
  }

  private findOpenByUser(userId: number) {
    return this.cashRegisterRepository.findOne({
      where: { userId, status: 'OPEN' },
    });
  }

  /**
   * Suma las ventas en EFECTIVO en la ventana [from, to].
   *
   * NOTA: las ventas todavía no llevan referencia al vendedor, así que el
   * arqueo cuenta el efectivo de TODO el negocio en la ventana de la caja.
   * Es correcto mientras haya una sola caja abierta a la vez (caso del vivero).
   * Cuando las ventas lleven `sellerId` se podrá filtrar por usuario.
   */
  private async sumCashSales(from: Date, to: Date): Promise<number> {
    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('COALESCE(SUM(sale.totalAmount), 0)', 'sum')
      .where('sale.paymentMethod = :method', { method: 'EFECTIVO' })
      .andWhere('sale.saleDate >= :from', { from })
      .andWhere('sale.saleDate <= :to', { to })
      .andWhere('sale.deletedAt IS NULL')
      .getRawOne<{ sum: string }>();

    return Number(result?.sum ?? 0);
  }
}
