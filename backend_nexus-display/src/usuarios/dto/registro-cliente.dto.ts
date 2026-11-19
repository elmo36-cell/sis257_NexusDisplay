import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegistroClienteDto {
  @ApiProperty({ example: 'Juan' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser de tipo cadena' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsNotEmpty({ message: 'El primer apellido es obligatorio' })
  @IsString({ message: 'El primer apellido debe ser de tipo cadena' })
  @MaxLength(100, {
    message: 'El primer apellido no puede tener más de 100 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly primerApellido: string;

  @ApiProperty({ required: false, example: 'Gómez' })
  @IsOptional()
  @IsString({ message: 'El segundo apellido debe ser de tipo cadena' })
  @MaxLength(100, {
    message: 'El segundo apellido no puede tener más de 100 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly segundoApellido?: string;

  @ApiProperty({ example: 'juan.perez' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @IsString({ message: 'El nombre de usuario debe ser de tipo cadena' })
  @MinLength(3, {
    message: 'El nombre de usuario debe tener al menos 3 caracteres',
  })
  @MaxLength(100, {
    message: 'El nombre de usuario no puede tener más de 100 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly nombreUsuario: string;

  @ApiProperty({ example: 'juan.perez@email.com' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  @MaxLength(100, { message: 'El correo no puede tener más de 100 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly correo: string;

  @ApiProperty({ required: false, example: '71234567' })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser de tipo cadena' })
  @MaxLength(30, { message: 'El teléfono no puede tener más de 30 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly telefono?: string;

  @ApiProperty({ example: '7123456', description: 'NIT o CI del cliente' })
  @IsNotEmpty({ message: 'El NIT / CI es obligatorio' })
  @IsString({ message: 'El NIT / CI debe ser de tipo cadena' })
  @MaxLength(30, { message: 'El NIT / CI no puede tener más de 30 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly documento: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña debe ser de tipo cadena' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  readonly clave: string;
}
