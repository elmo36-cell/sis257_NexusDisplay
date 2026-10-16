import { Test, TestingModule } from '@nestjs/testing';
import { EspecificacionController } from './especificacion.controller';
import { EspecificacionService } from './especificacion.service';

describe('EspecificacionController', () => {
  let controller: EspecificacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EspecificacionController],
      providers: [EspecificacionService],
    }).compile();

    controller = module.get<EspecificacionController>(EspecificacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
