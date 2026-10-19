import { Test, TestingModule } from '@nestjs/testing';
import { DetallesCompraService } from './detalles-compra.service';

describe('DetallesCompraService', () => {
  let service: DetallesCompraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetallesCompraService],
    }).compile();

    service = module.get<DetallesCompraService>(DetallesCompraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
