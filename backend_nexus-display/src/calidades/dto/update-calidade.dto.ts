import { PartialType } from '@nestjs/swagger';
import { CreateCalidadeDto } from './create-calidade.dto';

export class UpdateCalidadeDto extends PartialType(CreateCalidadeDto) {}
