import { IsNumber, Min } from 'class-validator';

/** Apertura de caja: solo el monto inicial en efectivo. */
export class OpenCashRegisterDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  initialAmount: number;
}
