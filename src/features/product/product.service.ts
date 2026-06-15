import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CATEGORY_REPOSITORY,
  CategoryTypeOrmEntity,
} from 'src/database/entities/category.typeorm.entity';
import {
  PRODUCT_REPOSITORY,
  ProductTypeOrmEntity,
} from 'src/database/entities/product.typeorm.entity';
import { Between, MoreThan, QueryFailedError, Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

/**
 * Umbral para considerar un producto en "STOCK BAJO" (badge del diseño).
 * Valor por defecto temporal: a futuro será configurable por el usuario desde
 * el Dashboard (se leerá de la BD, no de esta constante).
 */
export const LOW_STOCK_THRESHOLD = 10;

export type StockStatus = 'SIN_STOCK' | 'STOCK_BAJO' | 'EN_STOCK';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: Repository<ProductTypeOrmEntity>,

    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: Repository<CategoryTypeOrmEntity>,
  ) {}

  async findAll(query: QueryProductDto) {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    // Búsqueda parametrizada: el valor va como binding (:search), nunca
    // concatenado en el SQL (evita inyección).
    if (query.search) {
      qb.andWhere('product.name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    // La columna de orden sale de una lista blanca, no del texto del usuario.
    const sortColumn =
      query.sortBy === 'category' ? 'category.name' : 'product.name';
    qb.orderBy(sortColumn, query.order);

    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((product) => this.withStatus(product)),
      total,
      page: query.page,
      limit: query.limit,
      pages: Math.ceil(total / query.limit),
    };
  }

  /** Contadores para las tarjetas: TOTAL / EN STOCK / STOCK BAJO / SIN STOCK. */
  async getStats() {
    const [total, outOfStock, lowStock, inStock] = await Promise.all([
      this.productRepository.count(),
      this.productRepository.count({ where: { stock: 0 } }),
      this.productRepository.count({
        where: { stock: Between(1, LOW_STOCK_THRESHOLD) },
      }),
      this.productRepository.count({
        where: { stock: MoreThan(LOW_STOCK_THRESHOLD) },
      }),
    ]);

    return { total, inStock, lowStock, outOfStock };
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return this.withStatus(product);
  }

  async create(data: CreateProductDto) {
    await this.ensureCategoryExists(data.categoryId);

    const product = this.productRepository.create({
      name: data.name,
      description: data.description ?? '',
      price: data.price,
      stock: data.stock,
      imageUrl: data.imageUrl ?? '',
      categoryId: data.categoryId,
    });

    const saved = await this.productRepository.save(product);
    return this.findOne(saved.id);
  }

  async update(id: number, data: UpdateProductDto) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) throw new NotFoundException('Producto no encontrado');

    if (data.categoryId && data.categoryId !== product.categoryId) {
      await this.ensureCategoryExists(data.categoryId);
    }

    Object.assign(product, data);
    await this.productRepository.save(product);
    return this.findOne(id);
  }

  async remove(id: number) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) throw new NotFoundException('Producto no encontrado');

    try {
      await this.productRepository.remove(product);
    } catch (error) {
      // No filtramos el detalle del error de BD al cliente (OWASP A05).
      if (error instanceof QueryFailedError) {
        throw new ConflictException(
          'No se puede eliminar el producto porque tiene ventas o compras asociadas',
        );
      }
      throw error;
    }

    return { id };
  }

  private async ensureCategoryExists(categoryId: number) {
    const exists = await this.categoryRepository.existsBy({ id: categoryId });
    if (!exists) {
      throw new BadRequestException(`La categoría ${categoryId} no existe`);
    }
  }

  private withStatus(product: ProductTypeOrmEntity) {
    return { ...product, status: this.resolveStatus(product.stock) };
  }

  private resolveStatus(stock: number): StockStatus {
    if (stock <= 0) return 'SIN_STOCK';
    if (stock <= LOW_STOCK_THRESHOLD) return 'STOCK_BAJO';
    return 'EN_STOCK';
  }
}
