import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min, MinLength } from "class-validator";

export class CreatePantallaDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID del modelo es obligatorio' })
  @IsInt({ message: 'El ID del modelo debe ser un número entero' })
  @IsPositive({ message: 'El ID del modelo debe ser un número positivo' })
  readonly idModelo: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID de la categoría es obligatorio' })
  @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
  @IsPositive({ message: 'El ID de la categoría debe ser un número positivo' })
  readonly idCategoria: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID de la calidad es obligatorio' })
  @IsInt({ message: 'El ID de la calidad debe ser un número entero' })
  @IsPositive({ message: 'El ID de la calidad debe ser un número positivo' })
  readonly idCalidad: number;

  @ApiProperty({ example: 'SCR-IP14P-OLED' })
  @IsNotEmpty({ message: 'El SKU es obligatorio' })
  @IsString({ message: 'El SKU debe ser de tipo cadena' })
  @MaxLength(50, { message: 'El SKU no puede tener más de 50 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly sku: string;

  @ApiProperty({ example: 'Pantalla OLED para iPhone 14 Pro' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser de tipo cadena' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(120, { message: 'El nombre no puede tener más de 120 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly nombre: string;

  @ApiProperty({
    example:
      'Display compatible con sensor de proximidad y alta tasa de refresco',
  })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString({ message: 'La descripción debe ser de tipo cadena' })
  @MaxLength(255, {
    message: 'La descripción no puede tener más de 255 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly descripcion: string;

  @ApiProperty({ example: 45.0 })
  @IsNotEmpty({ message: 'El precio de compra es obligatorio' })
  @IsNumber({}, { message: 'El precio de compra debe ser un número válido' })
  @Min(0, { message: 'El precio de compra no puede ser negativo' })
  readonly precioCompra: number;

  @ApiProperty({ example: 85.0 })
  @IsNotEmpty({ message: 'El precio minorista es obligatorio' })
  @IsNumber({}, { message: 'El precio minorista debe ser un número válido' })
  @Min(0, { message: 'El precio minorista no puede ser negativo' })
  readonly precioMinorista: number;

  @ApiProperty({ example: 70.0 })
  @IsNotEmpty({ message: 'El precio mayorista es obligatorio' })
  @IsNumber({}, { message: 'El precio mayorista debe ser un número válido' })
  @Min(0, { message: 'El precio mayorista no puede ser negativo' })
  readonly precioMayorista: number;

  @ApiProperty({ example: 'https://ejemplo.com/imagen.jpg' })
  @IsNotEmpty({ message: 'La imagen es obligatoria' })
  @IsString({ message: 'La imagen debe ser de tipo cadena' })
  @MaxLength(500, { message: 'La imagen no puede tener más de 500 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly imagen: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser de tipo booleano' })
  readonly estado?: boolean;
}
