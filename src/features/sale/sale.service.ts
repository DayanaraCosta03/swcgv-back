import { randomUUID } from 'node:crypto';

import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MAIN_DATA_SOURCE } from 'src/database/database.provider';
import { ClientTypeOrmEntity } from 'src/database/entities/client.typeorm.entity';
import { ProductTypeOrmEntity } from 'src/database/entities/product.typeorm.entity';
import { SaleItemTypeOrmEntity } from 'src/database/entities/sale-item.typeorm.entity';
import {
  SALE_REPOSITORY,
  SaleTypeOrmEntity,
} from 'src/database/entities/sale.typeorm.entity';
import { DataSource, Repository } from 'typeorm';

import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySaleDto } from './dto/query-sale.dto';

@Injectable()
export class SaleService {
  constructor(
    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: Repository<SaleTypeOrmEntity>,

    @Inject(MAIN_DATA_SOURCE)
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Registra una venta de forma atómica (transacción):
   *  1. Valida el cliente (si se envió) y cada producto.
   *  2. Verifica que haya stock suficiente.
   *  3. Descuenta el stock automáticamente.
   *  4. Calcula los totales con el precio del producto en este momento.
   *  5. Guarda la venta y sus líneas.
   *
   * Si algo falla (p. ej. stock insuficiente), TODA la operación se revierte:
   * no se descuenta stock ni se crea una venta a medias.
   */
  async create(data: CreateSaleDto) {
    // Idempotencia: si llega una clave ya registrada, devolvemos la venta
    // existente en vez de crear otra (reintento de red seguro).
    if (data.idempotencyKey) {
      const existing = await this.saleRepository.findOne({
        where: { idempotencyKey: data.idempotencyKey },
      });
      if (existing) return this.findOne(existing.id);
    }
    const idempotencyKey = data.idempotencyKey ?? randomUUID();

    const saleId = await this.dataSource.transaction(async (manager) => {
      let client: ClientTypeOrmEntity | undefined;
      if (data.clientId) {
        const found = await manager.findOne(ClientTypeOrmEntity, {
          where: { id: data.clientId },
        });
        if (!found) throw new NotFoundException('Cliente no encontrado');
        client = found;
      }

      const sale = await manager.save(
        manager.create(SaleTypeOrmEntity, {
          saleDate: new Date(),
          totalAmount: 0,
          paymentMethod: data.paymentMethod,
          documentType: data.documentType,
          idempotencyKey,
          yapeOperation: data.yapeOperation ?? null,
          client,
        }),
      );

      let totalAmount = 0;
      const saleItems: SaleItemTypeOrmEntity[] = [];

      for (const item of data.items) {
        const product = await manager.findOne(ProductTypeOrmEntity, {
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(
            `Producto con id ${item.productId} no encontrado`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para "${product.name}" ` +
              `(disponible: ${product.stock}, solicitado: ${item.quantity})`,
          );
        }

        // El precio sale del producto, NO del frontend.
        const unitPrice = Number(product.price);
        const totalPrice = unitPrice * item.quantity;
        totalAmount += totalPrice;

        // Actualización automática de stock.
        product.stock -= item.quantity;
        await manager.save(product);

        saleItems.push(
          manager.create(SaleItemTypeOrmEntity, {
            sale,
            product,
            quantity: item.quantity,
            unitPrice,
            totalPrice,
          }),
        );
      }

      await manager.save(saleItems);

      sale.totalAmount = totalAmount;
      await manager.save(sale);

      return sale.id;
    });

    return this.findOne(saleId);
  }

  /** Historial de ventas con filtros (cliente, rango de fechas) y paginación. */
  async findAll(query: QuerySaleDto) {
    const qb = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.client', 'client');

    if (query.clientId) {
      qb.andWhere('client.id = :clientId', { clientId: query.clientId });
    }

    if (query.startDate) {
      qb.andWhere('sale.saleDate >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      qb.andWhere('sale.saleDate <= :endDate', { endDate: query.endDate });
    }

    qb.orderBy('sale.saleDate', query.order);
    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      pages: Math.ceil(total / query.limit),
    };
  }

  /** Detalle de una venta: cliente + líneas con su producto. */
  async findOne(id: number) {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: { client: true, saleItems: { product: true } },
    });
    if (!sale) throw new NotFoundException('Venta no encontrada');
    return sale;
  }

  /**
   * Anula una venta (soft delete) y devuelve el stock al inventario,
   * de forma atómica. Solo administradores (ver el controller).
   */
  async remove(id: number) {
    await this.dataSource.transaction(async (manager) => {
      const sale = await manager.findOne(SaleTypeOrmEntity, {
        where: { id },
        relations: { saleItems: { product: true } },
      });
      if (!sale) throw new NotFoundException('Venta no encontrada');

      for (const item of sale.saleItems) {
        const product = item.product;
        product.stock += item.quantity;
        await manager.save(product);
      }

      await manager.softRemove(sale.saleItems);
      await manager.softRemove(sale);
    });

    return { id };
  }
}
