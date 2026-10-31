import { Test, TestingModule } from '@nestjs/testing';
import { InventarioAlmacenController } from './inventario-almacen.controller';
import { InventarioAlmacenService } from './inventario-almacen.service';

describe('InventarioAlmacenController', () => {
  let controller: InventarioAlmacenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventarioAlmacenController],
      providers: [InventarioAlmacenService],
    }).compile();

    controller = module.get<InventarioAlmacenController>(InventarioAlmacenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
