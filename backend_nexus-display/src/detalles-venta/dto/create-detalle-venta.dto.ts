import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class CreateDetalleVentaDto {
  @ApiProperty({ required: false , example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de la venta debe ser un número entero' })
  @IsPositive({ message: 'El ID de la venta debe ser un número positivo' })
  readonly idVenta?: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID de la pantalla es obligatorio' })
  @IsInt({ message: 'El ID de la pantalla debe ser un número entero' })
  @IsPositive({ message: 'El ID de la pantalla debe ser un número positivo' })
  readonly idPantalla: number;

  @ApiProperty({ example: 2 })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  readonly cantidad: number;

  @ApiProperty({ example: 175.0 })
  @IsNotEmpty({ message: 'El precio unitario es obligatorio' })
  @IsNumber({}, { message: 'El precio unitario debe ser de tipo numérico' })
  @IsPositive({ message: 'El precio unitario debe ser mayor a 0' })
  readonly precioUnitario: number;
}
