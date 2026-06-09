import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CATEGORY_REPOSITORY,
  CategoryTypeOrmEntity,
} from 'src/database/entities/category.typeorm.entity';
import { QueryFailedError, Repository } from 'typeorm';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: Repository<CategoryTypeOrmEntity>,
  ) {}

  findAll() {
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async create(data: CreateCategoryDto) {
    await this.ensureNameIsFree(data.name);
    const category = this.categoryRepository.create({ name: data.name });
    return this.categoryRepository.save(category);
  }

  async update(id: number, data: UpdateCategoryDto) {
    const category = await this.findOne(id);
    if (data.name && data.name !== category.name) {
      await this.ensureNameIsFree(data.name);
      category.name = data.name;
    }
    return this.categoryRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    try {
      await this.categoryRepository.remove(category);
    } catch (error) {
      // No exponemos el detalle del error de BD al cliente (OWASP A05).
      if (error instanceof QueryFailedError) {
        throw new ConflictException(
          'No se puede eliminar la categoría porque tiene productos asociados',
        );
      }
      throw error;
    }
    return { id };
  }

  private async ensureNameIsFree(name: string) {
    const existing = await this.categoryRepository.findOneBy({ name });
    if (existing)
      throw new ConflictException('Ya existe una categoría con ese nombre');
  }
}
