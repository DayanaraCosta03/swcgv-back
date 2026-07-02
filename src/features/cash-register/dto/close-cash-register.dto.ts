import { IsNumber, Min } from 'class-validator';

/** Cierre de caja: el monto final contado por el usuario. */
export class CloseCashRegisterDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  finalAmount: number;
}
