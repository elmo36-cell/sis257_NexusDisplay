import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAlmacenDto {
  @ApiProperty({ example: 'Almacén Central Sucre' })
  @IsNotEmpty({ message: 'El nombre del almacén es obligatorio' })
  @IsString({ message: 'El nombre debe ser de tipo cadena' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly nombre: string;

  @ApiProperty({ example: 'Av. Jaime Mendoza #456' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @IsString({ message: 'La dirección debe ser de tipo cadena' })
  @MaxLength(200, {
    message: 'La dirección no puede tener más de 200 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly direccion: string;

  @ApiProperty({ required: false, example: '123-456-7890' })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser de tipo cadena' })
  @MaxLength(30, { message: 'El teléfono no puede tener más de 30 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly telefono?: string;
}
