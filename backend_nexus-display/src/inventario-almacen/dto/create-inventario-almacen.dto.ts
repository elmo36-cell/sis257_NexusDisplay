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

  @ApiProperty({example: 10})
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsInt({ message: 'La cantidad debe ser de tipo numérico' })
  @Min(0, { message: 'La cantidad no puede ser menor a 0' })
  readonly cantidad: number;
}
