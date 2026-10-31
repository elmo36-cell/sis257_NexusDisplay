import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsPositive, Min } from "class-validator";

export class CreateInventarioAlmacenDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID de la pantalla es obligatorio' })
  @IsInt({ message: 'El ID de la pantalla debe ser un número entero' })
  @IsPositive({ message: 'El ID de la pantalla debe ser un número positivo' })
  readonly idPantalla: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID del almacén es obligatorio' })
  @IsInt({ message: 'El ID del almacén debe ser un número entero' })
  @IsPositive({ message: 'El ID del almacén debe ser un número positivo' })
  readonly idAlmacen: number;

  @ApiProperty({ example: 25 })
  @IsNotEmpty({ message: 'El stock actual es obligatorio' })
  @IsInt({ message: 'El stock actual debe ser un número entero' })
  @Min(0, { message: 'El stock actual no puede ser un número negativo' })
  readonly stockActual: number;

  @ApiProperty({ example: 5 })
  @IsNotEmpty({ message: 'El stock mínimo es obligatorio' })
  @IsInt({ message: 'El stock mínimo debe ser un número entero' })
  @Min(0, { message: 'El stock mínimo no puede ser un número negativo' })
  readonly stockMinimo: number;
}
