import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSupplierDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(100, { message: 'El nombre no debe superar los 100 caracteres' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15, { message: 'El teléfono no debe superar los 15 caracteres' })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'El RUC no debe superar los 20 caracteres' })
  ruc?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El formato de correo no es válido' })
  @MaxLength(255, { message: 'El correo no debe superar los 255 caracteres' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La dirección no debe superar los 500 caracteres' })
  address?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
