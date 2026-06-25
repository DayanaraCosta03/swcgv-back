import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import type {
  DocumentType,
  PaymentMethod,
} from 'src/database/entities/sale.typeorm.entity';

const PAYMENT_METHODS: PaymentMethod[] = [
  'EFECTIVO',
  'YAPE',
  'PLIN',
  'TRANSFERENCIA',
];

const DOCUMENT_TYPES: DocumentType[] = ['BOLETA', 'FACTURA', 'TICKET'];

/**
 * Una línea de la venta: qué producto y cuántas unidades. El precio NO se
 * recibe del cliente; se toma del producto en el momento de la venta (en el
 * servicio), para evitar que se manipule el precio desde el frontend.
 */
export class CreateSaleItemDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateSaleDto {
  /** Cliente opcional: se permiten ventas sin cliente registrado (venta rápida). */
  @IsOptional()
  @IsInt()
  @IsPositive()
  clientId?: number;

  /** Método de pago (lista blanca: nunca texto libre del cliente). */
  @IsIn(PAYMENT_METHODS)
  paymentMethod: PaymentMethod;

  /** Tipo de comprobante a emitir. */
  @IsIn(DOCUMENT_TYPES)
  documentType: DocumentType;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
