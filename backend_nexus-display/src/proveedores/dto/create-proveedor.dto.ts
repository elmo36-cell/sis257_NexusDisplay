import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

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
  readonly nombreEmpresa: string;

  @ApiProperty({ example: 'Carlos Mendoza' })
  @IsNotEmpty({ message: 'El nombre del contacto es obligatorio' })
  @IsString({ message: 'El contacto debe ser de tipo cadena' })
  @MaxLength(100, {
    message: 'El contacto no puede tener más de 100 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly contacto: string;

  @ApiProperty({ example: '+59170123456' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @IsString({ message: 'El teléfono debe ser de tipo cadena' })
  @MaxLength(20, { message: 'El teléfono no puede tener más de 20 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly telefono: string;

  @ApiProperty({ example: 'ventas@globaldisplays.com' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  @MaxLength(100, { message: 'El correo no puede tener más de 100 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  readonly email: string;

  @ApiProperty({ example: 'Av. Principal #456, Zona Industrial' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @IsString({ message: 'La dirección debe ser de tipo cadena' })
  @MaxLength(200, {
    message: 'La dirección no puede tener más de 200 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly direccion: string;

  @ApiProperty({ example: 'China' })
  @IsNotEmpty({ message: 'El país de origen es obligatorio' })
  @IsString({ message: 'El país de origen debe ser de tipo cadena' })
  @MaxLength(50, {
    message: 'El país de origen no puede tener más de 50 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly paisOrigen: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser de tipo booleano' })
  readonly estado?: boolean;
}
