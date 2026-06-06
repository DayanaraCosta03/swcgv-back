import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
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

  @OneToMany(() => ProductTypeOrmEntity, (product) => product.purchaseItems)
  @JoinColumn({ name: 'product_id' })
  product: ProductTypeOrmEntity;

  @OneToMany(() => PurchaseTypeOrmEntity, (purchase) => purchase.purchaseItems)
  @JoinColumn({ name: 'purchase_id' })
  purchase: PurchaseTypeOrmEntity;
}
