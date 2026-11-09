import { Test, TestingModule } from '@nestjs/testing';
import { DetallesVentaService } from './detalles-venta.service';

describe('DetallesVentaService', () => {
  let service: DetallesVentaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetallesVentaService],
    }).compile();

    service = module.get<DetallesVentaService>(DetallesVentaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
