import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNumber,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';

/** Una línea de la compra: producto, cantidad y costo unitario pactado. */
export class CreatePurchaseItemDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @IsPositive()
  quantity: number;

  /** Costo unitario de compra (actualiza el costo del producto). */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitCost: number;
}

export class CreatePurchaseDto {
  @IsInt()
  @IsPositive()
  supplierId: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items: CreatePurchaseItemDto[];
}
