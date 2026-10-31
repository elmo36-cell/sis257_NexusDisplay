import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDecimal, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";

export class CreateVentaDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @IsPositive({ message: 'El ID del usuario debe ser un número positivo' })
  readonly idUsuario: number;

  @ApiProperty({ example: 'Minorista' })
  @IsNotEmpty({ message: 'El tipo de venta es obligatorio' })
  @IsString({ message: 'El tipo de venta debe ser de tipo cadena' })
  @MaxLength(20, {
    message: 'El tipo de venta no puede tener más de 20 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly tipoVenta: string;

  @ApiProperty({ example: 350.0 })
  @IsNotEmpty({ message: 'El total es obligatorio' })
  @IsDecimal(
    { decimal_digits: '2' },
    { message: 'El total debe ser un número decimal con hasta 2 decimales' },
  )
  readonly total: number;

  @ApiProperty({ example: 'Completado' })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsString({ message: 'El estado debe ser de tipo cadena' })
  @MaxLength(30, { message: 'El estado no puede tener más de 30 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly estado: string;

  @ApiProperty({
    example: 'Venta realizada al contado con entrega inmediata',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser de tipo cadena' })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly observaciones?: string;
}
