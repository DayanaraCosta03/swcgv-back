/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { AppModule } from '../app.module';
import { MAIN_DATA_SOURCE } from './database.provider';
import { CategoryTypeOrmEntity } from './entities/category.typeorm.entity';
import { ClientTypeOrmEntity } from './entities/client.typeorm.entity';
import { ProductTypeOrmEntity } from './entities/product.typeorm.entity';
import { SupplierTypeOrmEntity } from './entities/supplier.typeorm.entity';
import { SaleTypeOrmEntity } from './entities/sale.typeorm.entity';
import { SaleService } from '../features/sale/sale.service';

const PAYMENTS = ['EFECTIVO', 'YAPE', 'PLIN', 'TRANSFERENCIA'] as const;
const DOCS = ['BOLETA', 'FACTURA', 'TICKET'] as const;

/* -------------------------------------------------------------------------- */
/* Seed de datos ALEATORIOS para pruebas.                                     */
/*                                                                            */
/* Resetea product / client / supplier y los vuelve a llenar con datos        */
/* aleatorios coherentes. Mantiene las categorías y el usuario admin.         */
/* Es idempotente: puedes ejecutarlo las veces que quieras sin acumular.      */
/*                                                                            */
/* Nota: NO genera ventas/compras porque el módulo Sale no está cableado en   */
/* AppModule y las entidades sale_item/purchase_item tienen las relaciones    */
/* mal mapeadas (@OneToMany en vez de @ManyToOne), por lo que no persisten.   */
/* -------------------------------------------------------------------------- */

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)];

const pickMany = <T>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(rand(0, copy.length - 1), 1)[0]);
  }
  return out;
};

const money = (min: number, max: number) =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

const PLANTS: Record<string, string[]> = {
  Flores: [
    'Rosa Roja', 'Girasol', 'Tulipán', 'Orquídea Phalaenopsis', 'Margarita',
    'Clavel', 'Lirio Blanco', 'Gerbera', 'Petunia', 'Dalia', 'Begonia', 'Geranio',
  ],
  Arbustos: [
    'Hortensia', 'Buganvilla', 'Lavanda', 'Romero', 'Azalea', 'Hibisco',
    'Jazmín', 'Gardenia', 'Boj', 'Adelfa',
  ],
  'Árboles': [
    'Ficus Benjamina', 'Olivo', 'Limonero', 'Naranjo', 'Palto', 'Jacarandá',
    'Molle Costero', 'Ciprés', 'Pino', 'Sauce Llorón',
  ],
  'Suculentas y Cactus': [
    'Echeveria', 'Aloe Vera', 'Cactus San Pedro', 'Planta Jade', 'Sedum',
    'Haworthia', 'Agave', 'Opuntia', 'Lithops', 'Crásula',
  ],
  Interior: [
    'Pothos', 'Sansevieria', 'Monstera Deliciosa', 'Helecho de Boston',
    'Ficus Lyrata', 'Calathea', 'Zamioculca', 'Espatifilo', 'Dracena',
    'Potos Marble',
  ],
};

const SIZES = ['Pequeña', 'Mediana', 'Grande'];
const POTS = ['maceta de barro', 'maceta plástica', 'maceta colgante', 'a raíz desnuda'];

const FIRST_NAMES = [
  'Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Rosa', 'Pedro', 'Lucía', 'Jorge',
  'Carmen', 'Miguel', 'Sofía', 'José', 'Elena', 'Andrés', 'Patricia', 'Diego',
  'Valeria', 'Fernando', 'Gabriela', 'Ricardo', 'Daniela', 'Manuel', 'Camila',
];
const LAST_NAMES = [
  'Pérez', 'Gómez', 'Rodríguez', 'Martínez', 'López', 'Sánchez', 'Díaz',
  'Torres', 'Flores', 'Vargas', 'Castillo', 'Ramírez', 'Rojas', 'Mendoza',
  'Quispe', 'Huamán', 'Chávez', 'Romero', 'Cruz', 'Reyes',
];
const STREETS = [
  'Av. Larco', 'Calle Real', 'Jr. Pizarro', 'Av. España', 'Av. América Sur',
  'Jr. Bolívar', 'Av. Húsares de Junín', 'Calle Independencia', 'Av. Mansiche',
];
const DISTRICTS = [
  'Trujillo', 'El Porvenir', 'La Esperanza', 'Víctor Larco', 'Moche',
  'Huanchaco', 'Florencia de Mora', 'Laredo',
];

const SUPPLIER_BASE = [
  'Vivero Los Jardines', 'AgroAndes S.A.C.', 'FertiMax Perú', 'Semillas del Norte',
  'Vivero Santa Rosa', 'Plásticos Agrícolas Trujillo', 'GreenPro Importaciones',
  'Macetas y Sustratos EIRL', 'Vivero La Campiña', 'Agroinsumos del Pacífico',
];

async function bootstrap() {
  console.log('🌱 Seed de datos aleatorios (reset + reseed)...\n');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const dataSource = app.get<DataSource>(MAIN_DATA_SOURCE);
    const categoryRepo = dataSource.getRepository(CategoryTypeOrmEntity);
    const productRepo = dataSource.getRepository(ProductTypeOrmEntity);
    const clientRepo = dataSource.getRepository(ClientTypeOrmEntity);
    const supplierRepo = dataSource.getRepository(SupplierTypeOrmEntity);

    /* --- Reset (limpia ventas/compras también por si existieran) --- */
    await dataSource.query(
      'TRUNCATE TABLE sale_item, sale, purchase_item, purchase, product, client, supplier RESTART IDENTITY CASCADE',
    );
    console.log('✔ Tablas reiniciadas (categorías y usuario admin intactos).');

    /* --- Categorías (asegurar que existan) --- */
    for (const name of Object.keys(PLANTS)) {
      if (!(await categoryRepo.findOneBy({ name }))) {
        await categoryRepo.save(categoryRepo.create({ name }));
      }
    }
    const categories = await categoryRepo.find();
    console.log(`✔ Categorías: ${categories.length}`);

    /* --- Productos (todas las plantas del catálogo, con tamaño aleatorio) --- */
    let imgSeed = 1;
    const products: ProductTypeOrmEntity[] = [];
    for (const cat of categories) {
      const plantList = PLANTS[cat.name] ?? PLANTS.Flores;
      for (const plant of plantList) {
        const size = pick(SIZES);
        products.push(
          productRepo.create({
            name: `${plant} ${size}`,
            description: `${plant} de tamaño ${size.toLowerCase()}, en ${pick(POTS)}. Ideal para ${
              cat.name === 'Interior' ? 'espacios interiores' : 'jardín y exteriores'
            }.`,
            price: money(8, 250),
            stock: rand(0, 120),
            imageUrl: `https://picsum.photos/seed/plant${imgSeed++}/400/300`,
            categoryId: cat.id,
          }),
        );
      }
    }
    await productRepo.save(products);
    console.log(`✔ Productos: ${products.length}`);

    /* --- Clientes (25) con DNI único --- */
    const usedDni = new Set<string>();
    const clients: ClientTypeOrmEntity[] = [];
    while (clients.length < 25) {
      const dni = String(rand(10000000, 79999999));
      if (usedDni.has(dni)) continue;
      usedDni.add(dni);
      const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)} ${pick(LAST_NAMES)}`;
      clients.push(
        clientRepo.create({
          name,
          phoneNumber: `9${rand(10000000, 99999999)}`,
          dni,
          email: `${name.split(' ')[0].toLowerCase()}.${dni.slice(-4)}@example.com`,
          address: `${pick(STREETS)} ${rand(100, 1999)}, ${pick(DISTRICTS)}`,
          isActive: Math.random() > 0.15,
          notes: pick([
            'Cliente frecuente.', 'Prefiere entrega por la mañana.',
            'Pago en efectivo.', 'Aplica descuento del 10%.', '',
          ]),
        }),
      );
    }
    await clientRepo.save(clients);
    console.log(`✔ Clientes: ${clients.length}`);

    /* --- Proveedores (8) --- */
    const suppliers = pickMany(SUPPLIER_BASE, 8).map((base) =>
      supplierRepo.create({
        name: base,
        phoneNumber: `9${rand(10000000, 99999999)}`,
        ruc: `20${rand(100000000, 999999999)}`,
        email: `ventas@${base.split(' ')[0].toLowerCase()}.com`,
        address: `${pick(STREETS)} ${rand(100, 1999)}, ${pick(DISTRICTS)}`,
        isActive: Math.random() > 0.2,
      }),
    );
    await supplierRepo.save(suppliers);
    console.log(`✔ Proveedores: ${suppliers.length}`);

    /* --- Ventas (vía SaleService real: descuenta stock y enlaza ítems) --- */
    const saleService = app.get(SaleService, { strict: false });
    const saleRepo = dataSource.getRepository(SaleTypeOrmEntity);
    const allClients = await clientRepo.find();
    let saleOk = 0;
    for (let i = 0; i < 60; i++) {
      const inStock = (await productRepo.find()).filter((p) => p.stock > 0);
      if (!inStock.length) break;
      const chosen = pickMany(inStock, rand(1, 4));
      const items = chosen.map((p) => ({
        productId: p.id,
        quantity: rand(1, Math.min(4, p.stock)),
      }));
      try {
        const sale = await saleService.create({
          clientId: Math.random() > 0.3 ? pick(allClients).id : undefined,
          paymentMethod: pick([...PAYMENTS]),
          documentType: pick([...DOCS]),
          items,
        });
        // Backdatear aleatoriamente (últimos ~6 meses) para los gráficos.
        const when = new Date();
        when.setDate(when.getDate() - rand(0, 175));
        await saleRepo.update(sale.id, { saleDate: when });
        saleOk++;
      } catch {
        // p.ej. stock insuficiente: se ignora y se continúa.
      }
    }
    console.log(`✔ Ventas: ${saleOk}`);

    console.log('\n✅ Seed completado.');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seed falló:', error);
    process.exit(1);
  });
