import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({ example: 'admin' })
  @IsNotEmpty({ message: 'El nombre de usuario no debe estar vacío' })
  @IsString({ message: 'El nombre de usuario debe ser texto' })
  @MaxLength(50, { message: 'El nombre de usuario no debe exceder 50 caracteres' })
  nombreUsuario: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'La clave no debe estar vacía' })
  @IsString({ message: 'La clave debe ser texto' })
  clave: string;
}