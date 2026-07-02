import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MAIN_DATA_SOURCE } from 'src/database/database.provider';
import { ProductTypeOrmEntity } from 'src/database/entities/product.typeorm.entity';
import { PurchaseItemTypeOrmEntity } from 'src/database/entities/purchase-item.typeorm.entity';
import {
  PURCHASE_REPOSITORY,
  PurchaseTypeOrmEntity,
} from 'src/database/entities/purchase.typeorm.entity';
import { SupplierTypeOrmEntity } from 'src/database/entities/supplier.typeorm.entity';
import { DataSource, Repository } from 'typeorm';

import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { QueryPurchaseDto } from './dto/query-purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(
    @Inject(PURCHASE_REPOSITORY)
    private readonly purchaseRepository: Repository<PurchaseTypeOrmEntity>,

    @Inject(MAIN_DATA_SOURCE)
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Registra una compra a un proveedor de forma atómica (transacción):
   *  1. Valida el proveedor y cada producto.
   *  2. Suma la cantidad comprada al stock de cada producto.
   *  3. Actualiza el costo del producto al costo unitario de la compra.
   *  4. Calcula el total de la compra.
   *
   * Si algo falla (p. ej. un producto no existe), TODA la operación se revierte:
   * no se suma stock ni se crea una compra a medias.
   */
  async create(data: CreatePurchaseDto) {
    const purchaseId = await this.dataSource.transaction(async (manager) => {
      const supplier = await manager.findOne(SupplierTypeOrmEntity, {
        where: { id: data.supplierId },
      });
      if (!supplier) throw new NotFoundException('Proveedor no encontrado');

      const purchase = await manager.save(
        manager.create(PurchaseTypeOrmEntity, {
          date: new Date(),
          total: 0,
          supplier,
        }),
      );

      let total = 0;
      const purchaseItems: PurchaseItemTypeOrmEntity[] = [];

      for (const item of data.items) {
        const product = await manager.findOne(ProductTypeOrmEntity, {
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(
            `Producto con id ${item.productId} no encontrado`,
          );
        }

        const totalPrice = item.unitCost * item.quantity;
        total += totalPrice;

        // Suma stock y actualiza el costo al de esta compra.
        product.stock += item.quantity;
        product.cost = item.unitCost;
        await manager.save(product);

        purchaseItems.push(
          manager.create(PurchaseItemTypeOrmEntity, {
            purchase,
            product,
            quantity: item.quantity,
            unitPrice: item.unitCost,
            totalPrice,
          }),
        );
      }

      await manager.save(purchaseItems);

      purchase.total = total;
      await manager.save(purchase);

      return purchase.id;
    });

    return this.findOne(purchaseId);
  }

  /** Historial de compras con filtros (proveedor, rango de fechas) y paginación. */
  async findAll(query: QueryPurchaseDto) {
    const qb = this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.supplier', 'supplier');

    if (query.supplierId) {
      qb.andWhere('supplier.id = :supplierId', {
        supplierId: query.supplierId,
      });
    }

    if (query.startDate) {
      qb.andWhere('purchase.date >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      qb.andWhere('purchase.date <= :endDate', { endDate: query.endDate });
    }

    qb.orderBy('purchase.date', query.order);
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

  /** Detalle de una compra: proveedor + líneas con su producto. */
  async findOne(id: number) {
    const purchase = await this.purchaseRepository.findOne({
      where: { id },
      relations: { supplier: true, purchaseItems: { product: true } },
    });
    if (!purchase) throw new NotFoundException('Compra no encontrada');
    return purchase;
  }
}
