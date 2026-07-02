import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ProductTypeOrmEntity } from './product.typeorm.entity';
import { PurchaseTypeOrmEntity } from './purchase.typeorm.entity';

@Entity({ name: 'purchase_item' })
export class PurchaseItemTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  // Un ítem de compra pertenece a UN producto y a UNA compra (ManyToOne).
  // Los lados inversos (product.purchaseItems / purchase.purchaseItems) son
  // OneToMany, así que este lado —el dueño de la FK— debe ser ManyToOne.
  @ManyToOne(() => ProductTypeOrmEntity, (product) => product.purchaseItems)
  @JoinColumn({ name: 'product_id' })
  product: ProductTypeOrmEntity;

  @ManyToOne(() => PurchaseTypeOrmEntity, (purchase) => purchase.purchaseItems)
  @JoinColumn({ name: 'purchase_id' })
  purchase: PurchaseTypeOrmEntity;
}
