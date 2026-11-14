import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RolNombre } from '../enums/rol-nombre.enum';

export class CreateUsuarioDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID del rol es obligatorio' })
  @IsInt({ message: 'El ID del rol debe ser un número entero' })
  readonly idRol: number;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @IsString({ message: 'El nombre de usuario debe ser de tipo cadena' })
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

  @ApiProperty({ required: false, example: '1234567890' })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser de tipo cadena' })
  @MaxLength(30, { message: 'El teléfono no puede tener más de 30 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly telefono?: string;

  @ApiProperty({ example: '12345678' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña debe ser de tipo cadena' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  readonly clave: string;

  @ApiProperty({ enum: RolNombre, required: false, default: RolNombre.CLIENTE })
  @IsOptional()
  @IsEnum(RolNombre, { message: 'El rol debe ser ADMIN, VENDEDOR o CLIENTE' })
  @Transform(({ value }): string | undefined =>
    typeof value == 'string' ? value.trim() : value,
  )
  readonly rol?: RolNombre;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser de tipo booleano' })
  readonly activo?: boolean;
}
