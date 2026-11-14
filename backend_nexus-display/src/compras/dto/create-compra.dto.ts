import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min, ValidateNested } from "class-validator";
import { CreateDetalleCompraDto } from "../../detalles-compra/dto/create-detalle-compra.dto";

export class CreateCompraDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID del proveedor es obligatorio' })
  @IsInt({ message: 'El ID del proveedor debe ser un número entero' })
  @IsPositive({ message: 'El ID del proveedor debe ser un número positivo' })
  readonly idProveedor: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @IsPositive({ message: 'El ID del usuario debe ser un número positivo' })
  readonly idUsuario: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El almacén es obligatorio' })
  @IsInt({ message: 'El almacén debe ser de tipo numérico' })
  readonly idAlmacen: number;

  @ApiProperty({ type: [CreateDetalleCompraDto] })
  @IsArray({ message: 'Los detalles deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un detalle de compra' })
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleCompraDto)
  readonly detalles: CreateDetalleCompraDto[];
} 
