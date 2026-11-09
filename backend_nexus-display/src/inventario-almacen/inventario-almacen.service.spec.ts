import { Test, TestingModule } from '@nestjs/testing';
import { InventarioAlmacenService } from './inventario-almacen.service';

describe('InventarioAlmacenService', () => {
  let service: InventarioAlmacenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventarioAlmacenService],
    }).compile();

    service = module.get<InventarioAlmacenService>(InventarioAlmacenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
