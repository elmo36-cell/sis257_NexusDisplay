import { Test, TestingModule } from '@nestjs/testing';
import { PantallaController } from './pantalla.controller';
import { PantallaService } from './pantalla.service';

describe('PantallaController', () => {
  let controller: PantallaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PantallaController],
      providers: [PantallaService],
    }).compile();

    controller = module.get<PantallaController>(PantallaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
