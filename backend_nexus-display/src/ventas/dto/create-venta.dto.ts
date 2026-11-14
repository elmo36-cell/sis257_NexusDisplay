import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateDetalleVentaDto } from '../../detalles-venta/dto/create-detalle-venta.dto';

export class CreateVentaDto {
  @ApiProperty({required: false, example: 1 })
  @IsOptional()
@Type(() => Number)
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @IsPositive({ message: 'El ID del usuario debe ser un número positivo' })
  readonly idUsuario?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNotEmpty({ message: 'El ID del almacén es obligatorio' })
  @IsInt({ message: 'El ID del almacén debe ser un número entero' })
  @IsPositive({ message: 'El ID del almacén debe ser un número positivo' })
  readonly idAlmacen: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'El nombre del cliente debe ser de tipo cadena' })
  @MaxLength(100, {
    message: 'El nombre del cliente no puede tener más de 100 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly nombreCliente?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'El documento del cliente debe ser de tipo cadena' })
  @MaxLength(30, {
    message: 'El documento del cliente no puede tener más de 30 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly documentoCliente?: string;

  @ApiProperty({ type: [CreateDetalleVentaDto] })
  @IsArray({ message: 'Los detalles deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'La venta debe incluir al menos una pantalla' })
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleVentaDto)
  readonly detalles: CreateDetalleVentaDto[];
}
