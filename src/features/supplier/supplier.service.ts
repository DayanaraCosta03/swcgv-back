import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  SUPPLIER_REPOSITORY,
  SupplierTypeOrmEntity,
} from 'src/database/entities/supplier.typeorm.entity';
import { Repository } from 'typeorm';

import { CreateSupplierDto } from './dto/create-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: Repository<SupplierTypeOrmEntity>,
  ) {}

  async findAll(query: QuerySupplierDto) {
    const qb = this.supplierRepository.createQueryBuilder('supplier');

    if (query.search) {
      qb.andWhere(
        '(supplier.name ILIKE :search OR supplier.phoneNumber ILIKE :search OR supplier.ruc ILIKE :search OR supplier.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy('supplier.name', 'ASC');

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

  async getStats() {
    const total = await this.supplierRepository.count();
    return { total };
  }

  async findOne(id: number) {
    const supplier = await this.supplierRepository.findOneBy({ id });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');
    return supplier;
  }

  async create(data: CreateSupplierDto) {
    const supplier = this.supplierRepository.create({
      name: data.name,
      phoneNumber: data.phoneNumber ?? '',
      ruc: data.ruc ?? '',
      email: data.email ?? '',
      address: data.address ?? '',
      isActive: data.isActive ?? true,
    });
    return this.supplierRepository.save(supplier);
  }

  async update(id: number, data: UpdateSupplierDto) {
    const supplier = await this.findOne(id);
    Object.assign(supplier, data);
    return this.supplierRepository.save(supplier);
  }

  async remove(id: number) {
    const supplier = await this.findOne(id);
    await this.supplierRepository.softRemove(supplier);
    return { id };
  }
}
