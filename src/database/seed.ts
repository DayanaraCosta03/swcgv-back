import { NestFactory } from '@nestjs/core';
import * as argon2 from 'argon2';
import { DataSource } from 'typeorm';

import { AppModule } from '../app.module';
import { MAIN_DATA_SOURCE } from './database.provider';
import { UserTypeormEntity } from './entities/user.typeorm.entity';

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
