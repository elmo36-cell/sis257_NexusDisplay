import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateDireccionDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El id del usuario es obligatorio' })
  @IsNumber({}, { message: 'El id del usuario debe ser numérico' })
  readonly idUsuario: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'La calle es obligatoria' })
  @IsString({ message: 'La calle debe ser de tipo cadena' })
  @MaxLength(150, { message: 'La calle no puede tener más de 150 caracteres' })
  @Transform(({ value }: { value: any }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly calle: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  @IsString({ message: 'La ciudad debe ser de tipo cadena' })
  @MaxLength(50, { message: 'La ciudad no puede tener más de 50 caracteres' })
  @Transform(({ value }: { value: any }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly ciudad: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'El código postal debe ser de tipo cadena' })
  @MaxLength(20, {
    message: 'El código postal no puede tener más de 20 caracteres',
  })
  @Transform(({ value }: { value: any }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly codigoPostal?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean({ message: 'El campo esPrincipal debe ser booleano' })
  readonly esPrincipal?: boolean;
}
