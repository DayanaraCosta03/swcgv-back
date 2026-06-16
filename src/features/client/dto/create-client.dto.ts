import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

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
  @MaxLength(255, { message: 'Las notas no deben superar los 255 caracteres' })
  notes?: string;
}
