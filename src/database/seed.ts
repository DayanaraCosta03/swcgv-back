import { NestFactory } from '@nestjs/core';
import * as argon2 from 'argon2';
import { DataSource } from 'typeorm';

import { AppModule } from '../app.module';
import { MAIN_DATA_SOURCE } from './database.provider';
import { UserTypeormEntity } from './entities/user.typeorm.entity';
import { CategoryTypeOrmEntity } from './entities/category.typeorm.entity';
import { ClientTypeOrmEntity } from './entities/client.typeorm.entity';

async function bootstrap() {
  console.log('Starting database seeding...');

  // Create a NestJS application context (standalone context)
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const dataSource = app.get<DataSource>(MAIN_DATA_SOURCE);
    const userRepository = dataSource.getRepository(UserTypeormEntity);

    const email = 'dcosta@unitru.edu.pe';
    const hashedPassword = await argon2.hash('Password123!');

    let user = await userRepository.findOneBy({ email });

    if (user) {
      console.log(
        `User with email ${email} already exists. Updating user details...`,
      );
      user.name = 'Dayanara Costa';
      user.password = hashedPassword;
      user.role = 'admin';
      user.needChangePassword = true;
      user.isActive = true;
      await userRepository.save(user);
      console.log('User updated successfully.');
    } else {
      console.log(`Creating user with email ${email}...`);
      user = userRepository.create({
        name: 'Dayanara Costa',
        email,
        password: hashedPassword,
        role: 'admin',
        needChangePassword: true,
        isActive: true,
      });
      await userRepository.save(user);
      console.log('User created successfully.');
    }

    // Seed categories
    const categoryRepository = dataSource.getRepository(CategoryTypeOrmEntity);
    console.log('Seeding categories...');
    const categoriesToSeed = [
      'Flores',
      'Arbustos',
      'Árboles',
      'Suculentas y Cactus',
      'Interior',
    ];

    for (const name of categoriesToSeed) {
      const exists = await categoryRepository.findOneBy({ name });
      if (!exists) {
        console.log(`Creating category: ${name}`);
        const category = categoryRepository.create({ name });
        await categoryRepository.save(category);
      } else {
        console.log(`Category already exists: ${name}`);
      }
    }
    console.log('Categories seeded successfully.');

    // Seed clients
    const clientRepository = dataSource.getRepository(ClientTypeOrmEntity);
    console.log('Seeding clients...');
    const clientsToSeed = [
      {
        name: 'Juan Pérez',
        phoneNumber: '987654321',
        dni: '12345678',
        email: 'juan.perez@example.com',
        address: 'Av. Larco 123, Trujillo',
        isActive: true,
        notes: 'Cliente frecuente, entrega por la mañana.',
      },
      {
        name: 'María Gómez',
        phoneNumber: '912345678',
        dni: '87654321',
        email: 'maria.gomez@example.com',
        address: 'Calle Real 456, El Porvenir',
        isActive: true,
        notes: 'Descuento del 10% aplicado.',
      },
      {
        name: 'Carlos Rodríguez',
        phoneNumber: '955443322',
        dni: '44556677',
        email: 'carlos.rod@example.com',
        address: 'Jr. Pizarro 789, Trujillo',
        isActive: false,
        notes: 'Pago en efectivo.',
      },
      {
        name: 'Ana Martínez',
        phoneNumber: '933221100',
        dni: '11223344',
        email: 'ana.martinez@example.com',
        address: 'Av. América Sur 1010, Trujillo',
        isActive: true,
        notes: 'Prefiere rosas rojas.',
      },
    ];

    for (const c of clientsToSeed) {
      let client = await clientRepository.findOneBy({ name: c.name });
      if (!client) {
        console.log(`Creating client: ${c.name}`);
        client = clientRepository.create(c);
      } else {
        console.log(`Updating client: ${c.name}`);
        Object.assign(client, c);
      }
      await clientRepository.save(client);
    }
    console.log('Clients seeded successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap()
  .then(() => {
    console.log('Seeding process completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding process failed:', error);
    process.exit(1);
  });
