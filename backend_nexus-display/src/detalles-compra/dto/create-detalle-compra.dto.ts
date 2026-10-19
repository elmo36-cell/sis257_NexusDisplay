import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsNumber, IsPositive, Min } from "class-validator";

export class CreateDetalleCompraDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID de la compra es obligatorio' })
  @IsInt({ message: 'El ID de la compra debe ser un número entero' })
  @IsPositive({ message: 'El ID de la compra debe ser un número positivo' })
  readonly idCompra: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID de la pantalla es obligatorio' })
  @IsInt({ message: 'El ID de la pantalla debe ser un número entero' })
  @IsPositive({ message: 'El ID de la pantalla debe ser un número positivo' })
  readonly idPantalla: number;

  @ApiProperty({ example: 10 })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @IsPositive({ message: 'La cantidad debe ser un número positivo' })
  readonly cantidad: number;

  @ApiProperty({ example: 45.0 })
  @IsNotEmpty({ message: 'El precio unitario es obligatorio' })
  @IsNumber({}, { message: 'El precio unitario debe ser un número válido' })
  @Min(0, { message: 'El precio unitario no puede ser negativo' })
  readonly precioUnitario: number;

  @ApiProperty({ example: 450.0 })
  @IsNotEmpty({ message: 'El subtotal es obligatorio' })
  @IsNumber({}, { message: 'El subtotal debe ser un número válido' })
  @Min(0, { message: 'El subtotal no puede ser negativo' })
  readonly subtotal: number;
}
