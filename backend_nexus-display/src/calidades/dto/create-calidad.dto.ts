import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCalidadDto {
  @ApiProperty({ example: 'Original OEM' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser de tipo cadena' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly nombre: string;

  @ApiProperty({
    required: false,
    example: 'Pantalla de alta gama con componentes originales de fábrica',
  })
  @IsString({ message: 'La descripción debe ser de tipo cadena' })
  @MaxLength(255, {
    message: 'La descripción no puede tener más de 255 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly descripcion?: string;
}
