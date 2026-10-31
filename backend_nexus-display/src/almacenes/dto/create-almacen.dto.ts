import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateAlmacenDto {
  @ApiProperty({ example: 'Almacén Central Sucre' })
  @IsNotEmpty({ message: 'El nombre del almacén es obligatorio' })
  @IsString({ message: 'El nombre debe ser de tipo cadena' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly nombre: string;

  @ApiProperty({ example: 'Av. Jaime Mendoza #456' })
  @IsNotEmpty({ message: 'La ubicación es obligatoria' })
  @IsString({ message: 'La ubicación debe ser de tipo cadena' })
  @MaxLength(200, {
    message: 'La ubicación no puede tener más de 200 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly ubicacion: string;

  @ApiProperty({
    example: 'Depósito principal de almacenamiento de pantallas y repuestos',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser de tipo cadena' })
  @MaxLength(255, {
    message: 'La descripción no puede tener más de 255 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly descripcion?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  readonly estado?: boolean;
}
