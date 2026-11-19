import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePantallaDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID del modelo es obligatorio' })
  @IsInt({ message: 'El ID del modelo debe ser un número entero' })
  @IsPositive({ message: 'El ID del modelo debe ser un número positivo' })
  readonly idModelo: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID de la calidad es obligatorio' })
  @IsInt({ message: 'El ID de la calidad debe ser un número entero' })
  @IsPositive({ message: 'El ID de la calidad debe ser un número positivo' })
  readonly idCalidad: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID de la categoría es obligatorio' })
  @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
  @IsPositive({ message: 'El ID de la categoría debe ser un número positivo' })
  readonly idCategoria: number;

  @ApiProperty({ example: 'Pantalla OLED para iPhone 14 Pro' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser de tipo cadena' })
  //@MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(120, { message: 'El nombre no puede tener más de 120 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly nombre: string;

  @ApiProperty({ example: 'SCR-IP14P-OLED' })
  @IsNotEmpty({ message: 'El código es obligatorio' })
  @IsString({ message: 'El código debe ser de tipo cadena' })
  @MaxLength(50, { message: 'El código no puede tener más de 50 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly codigo: string;

  @ApiProperty({ required: false, example: 'Negro' })
  @IsOptional()
  @IsString({ message: 'El color debe ser de tipo cadena' })
  @MaxLength(40, { message: 'El color no puede tener más de 40 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean({ message: 'El campo conMarco debe ser de tipo booleano' })
  readonly conMarco?: boolean;

  @ApiProperty({ example: 'https://ejemplo.com/imagen.jpg' })
  @IsNotEmpty({ message: 'La fotografía es obligatoria' })
  @IsString({ message: 'La fotografía debe ser de tipo cadena' })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly fotografia: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El precio de venta es obligatorio' })
  @IsNumber({}, { message: 'El precio de venta debe ser de tipo numérico' })
  @IsPositive({ message: 'El precio de venta debe ser mayor a 0' })
  readonly precioVenta: number;
}
