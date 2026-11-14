import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProveedorDto {
  @ApiProperty({ example: 'Importadora Global Displays S.R.L.' })
  @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio' })
  @IsString({ message: 'El nombre de la empresa debe ser de tipo cadena' })
  @MinLength(3, {
    message: 'El nombre de la empresa debe tener al menos 3 caracteres',
  })
  @MaxLength(120, {
    message: 'El nombre de la empresa no puede tener más de 120 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly nombre: string;

  @ApiProperty({ example: '123456789' })
  @IsNotEmpty({ message: 'El NIT es obligatorio' })
  @IsString({ message: 'El NIT debe ser de tipo cadena' })
  @MaxLength(25, { message: 'El NIT no puede tener más de 25 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly nit: string;

  @ApiProperty({ example: '+59170123456' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @IsString({ message: 'El teléfono debe ser de tipo cadena' })
  @MaxLength(20, { message: 'El teléfono no puede tener más de 20 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly telefono?: string;

  @ApiProperty({ example: 'Av. Principal #456, Zona Industrial' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @IsString({ message: 'La dirección debe ser de tipo cadena' })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly direccion: string;
}
