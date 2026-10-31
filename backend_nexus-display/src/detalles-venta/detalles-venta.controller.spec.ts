import { Test, TestingModule } from '@nestjs/testing';
import { DetallesVentaController } from './detalles-venta.controller';
import { DetallesVentaService } from './detalles-venta.service';

describe('DetallesVentaController', () => {
  let controller: DetallesVentaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetallesVentaController],
      providers: [DetallesVentaService],
    }).compile();

    controller = module.get<DetallesVentaController>(DetallesVentaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
