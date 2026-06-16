import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(255, { message: 'El nombre no debe superar los 255 caracteres' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(15, { message: 'El teléfono no debe superar los 15 caracteres' })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'El DNI no debe superar los 20 caracteres' })
  dni?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El formato de correo no es válido' })
  @MaxLength(255, { message: 'El correo no debe superar los 255 caracteres' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La dirección no debe superar los 255 caracteres' })
  address?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Las notas no deben superar los 255 caracteres' })
  notes?: string;
}
