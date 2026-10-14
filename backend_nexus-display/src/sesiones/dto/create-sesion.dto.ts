import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";


export class CreateSesionDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El id del usuario es obligatorio' })
  @IsNumber({}, { message: 'El id del usuario debe ser numérico' })
  readonly idUsuario: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'El token es obligatorio' })
  @IsString({ message: 'El token debe ser de tipo cadena' })
  @MaxLength(500, { message: 'El token no puede tener más de 500 caracteres' })
  @Transform(({ value }: { value: any }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly token: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'La fecha de expiración es obligatoria' })
  @IsDateString(
    {},
    { message: 'La fecha de expiración debe tener un formato de fecha válido' },
  )
  readonly fechaExpiracion: string;
}
