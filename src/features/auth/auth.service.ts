import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import {
  USER_REPOSITORY,
  UserTypeormEntity,
} from 'src/database/entities/user.typeorm.entity';
import { Repository } from 'typeorm';

import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: Repository<UserTypeormEntity>,

    private readonly jwtService: JwtService,
  ) {}

  async login(data: LoginUserDto) {
    const user = await this.userRepository.findOneBy({ email: data.email });
    if (!user) throw new UnauthorizedException('Credenciales invalidas');

    const isPasswordValid = await argon2.verify(user.password, data.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('Credenciales invalidas');

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
