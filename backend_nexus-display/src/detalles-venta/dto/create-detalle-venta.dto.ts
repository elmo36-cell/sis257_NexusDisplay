import { ApiProperty } from "@nestjs/swagger";
import { IsDecimal, IsInt, IsNotEmpty, IsPositive, Min } from "class-validator";

export class CreateDetalleVentaDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID de la venta es obligatorio' })
  @IsInt({ message: 'El ID de la venta debe ser un número entero' })
  @IsPositive({ message: 'El ID de la venta debe ser un número positivo' })
  readonly idVenta: number;

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
  @IsDecimal(
    { decimal_digits: '2' },
    {
      message:
        'El precio unitario debe ser un número decimal con hasta 2 decimales',
    },
  )
  readonly precioUnitario: number;

  @ApiProperty({ example: 350.0 })
  @IsNotEmpty({ message: 'El subtotal es obligatorio' })
  @IsDecimal(
    { decimal_digits: '2' },
    { message: 'El subtotal debe ser un número decimal con hasta 2 decimales' },
  )
  readonly subtotal: number;
}
