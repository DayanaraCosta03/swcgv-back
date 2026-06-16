import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CLIENT_REPOSITORY,
  ClientTypeOrmEntity,
} from 'src/database/entities/client.typeorm.entity';
import { Repository } from 'typeorm';

import { CreateClientDto } from './dto/create-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: Repository<ClientTypeOrmEntity>,
  ) {}

  async findAll(query: QueryClientDto) {
    const qb = this.clientRepository.createQueryBuilder('client');

    if (query.search) {
      qb.andWhere(
        '(client.name ILIKE :search OR client.phoneNumber ILIKE :search OR client.dni ILIKE :search OR client.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy('client.name', 'ASC');

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
    const total = await this.clientRepository.count();
    return { total };
  }

  async findOne(id: number) {
    const client = await this.clientRepository.findOneBy({ id });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    return client;
  }

  async create(data: CreateClientDto) {
    const client = this.clientRepository.create({
      name: data.name,
      phoneNumber: data.phoneNumber ?? '',
      dni: data.dni ?? '',
      email: data.email ?? '',
      address: data.address ?? '',
      isActive: data.isActive ?? true,
      notes: data.notes ?? '',
    });
    return this.clientRepository.save(client);
  }

  async update(id: number, data: UpdateClientDto) {
    const client = await this.findOne(id);
    Object.assign(client, data);
    return this.clientRepository.save(client);
  }

  async remove(id: number) {
    const client = await this.findOne(id);
    await this.clientRepository.softRemove(client);
    return { id };
  }
}
