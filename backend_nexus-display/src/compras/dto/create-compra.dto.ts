import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min } from "class-validator";

export class CreateCompraDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID del proveedor es obligatorio' })
  @IsInt({ message: 'El ID del proveedor debe ser un número entero' })
  @IsPositive({ message: 'El ID del proveedor debe ser un número positivo' })
  readonly idProveedor: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @IsPositive({ message: 'El ID del usuario debe ser un número positivo' })
  readonly idUsuario: number;

  @ApiProperty({ example: 'FAC-00123' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  @IsString({ message: 'El número de documento debe ser de tipo cadena' })
  @MaxLength(50, {
    message: 'El número de documento no puede tener más de 50 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly numeroDocumento: string;

  @ApiProperty({ example: 1500.5 })
  @IsNotEmpty({ message: 'El total es obligatorio' })
  @IsNumber({}, { message: 'El total debe ser un número válido' })
  @Min(0, { message: 'El total no puede ser negativo' })
  readonly total: number;

  @ApiProperty({ example: 'PENDIENTE' })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsString({ message: 'El estado debe ser de tipo cadena' })
  @MaxLength(30, { message: 'El estado no puede tener más de 30 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  readonly estado: string;

  @ApiProperty({
    example: 'Compra de pantallas OLED para reposición de stock',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser de tipo cadena' })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly observaciones?: string;
}
