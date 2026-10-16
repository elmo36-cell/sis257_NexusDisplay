import { PartialType } from '@nestjs/swagger';
import { CreateEspecificacionDto } from './create-especificacion.dto';

export class UpdateEspecificacionDto extends PartialType(CreateEspecificacionDto) {}
