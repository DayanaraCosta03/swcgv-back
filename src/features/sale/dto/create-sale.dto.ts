import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import type {
  DocumentType,
  PaymentMethod,
} from 'src/database/entities/sale.typeorm.entity';

const PAYMENT_METHODS: PaymentMethod[] = [
  'EFECTIVO',
  'TARJETA',
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

  /**
   * Clave de idempotencia (opcional). Si el cliente la envía, un reintento con
   * la misma clave devuelve la venta ya registrada en vez de duplicarla. Si no
   * llega, el servidor genera una. El POS nuevo (F5.2) siempre la envía.
   */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  idempotencyKey?: string;

  /**
   * Nro. de operación de Yape (opcional a nivel de datos para no romper el
   * front viejo). El POS nuevo (F5.2) lo exige en el cliente cuando el método
   * es YAPE.
   */
  @IsOptional()
  @IsString()
  @MaxLength(30)
  yapeOperation?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
