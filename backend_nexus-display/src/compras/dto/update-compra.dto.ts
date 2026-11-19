import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { CreateDetalleCompraDto } from '../../detalles-compra/dto/create-detalle-compra.dto';

/**
 * Corrección de una compra al proveedor. Todos los campos son opcionales porque
 * el admin puede cambiar solo la fecha, solo el proveedor o rehacer las líneas.
 * Si mandan las líneas, el servicio devuelve el stock viejo y aplica el nuevo.
 */
export class UpdateCompraDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt({ message: 'El ID del proveedor debe ser un número entero' })
  @IsPositive({ message: 'El ID del proveedor debe ser un número positivo' })
  readonly idProveedor?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt({ message: 'El almacén debe ser de tipo numérico' })
  @IsPositive({ message: 'El almacén debe ser un número positivo' })
  readonly idAlmacen?: number;

  @ApiPropertyOptional({ example: '2026-11-18T10:30:00.000Z' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
  readonly fecha?: string;

  @ApiPropertyOptional({ type: [CreateDetalleCompraDto] })
  @IsOptional()
  @IsArray({ message: 'Los detalles deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un detalle de compra' })
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleCompraDto)
  readonly detalles?: CreateDetalleCompraDto[];
}
