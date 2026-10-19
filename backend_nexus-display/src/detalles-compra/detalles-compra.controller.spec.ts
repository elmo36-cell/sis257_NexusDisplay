import { Test, TestingModule } from '@nestjs/testing';
import { DetallesCompraController } from './detalles-compra.controller';
import { DetallesCompraService } from './detalles-compra.service';

describe('DetallesCompraController', () => {
  let controller: DetallesCompraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetallesCompraController],
      providers: [DetallesCompraService],
    }).compile();

    controller = module.get<DetallesCompraController>(DetallesCompraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
