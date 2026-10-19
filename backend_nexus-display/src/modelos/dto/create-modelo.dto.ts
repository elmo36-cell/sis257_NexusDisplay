import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, MinLength } from "class-validator";

export class CreateModeloDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID de la marca es obligatorio' })
  @IsInt({ message: 'El ID de la marca debe ser un número entero' })
  @IsPositive({ message: 'El ID de la marca debe ser un número positivo' })
  readonly idMarca: number;

  @ApiProperty({ example: 'iPhone 14 Pro Max' })
  @IsNotEmpty({ message: 'El nombre del modelo es obligatorio' })
  @IsString({ message: 'El nombre debe ser de tipo cadena' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly nombre: string;

  @ApiProperty({ example: 2022 })
  @IsNotEmpty({ message: 'El año de lanzamiento es obligatorio' })
  @IsInt({ message: 'El año de lanzamiento debe ser un número entero' })
  @IsPositive({ message: 'El año de lanzamiento debe ser un número positivo' })
  readonly anioLanzamiento: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser de tipo booleano' })
  readonly estado?: boolean;
}
