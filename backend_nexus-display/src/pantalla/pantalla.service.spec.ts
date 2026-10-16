import { Test, TestingModule } from '@nestjs/testing';
import { PantallaService } from './pantalla.service';

describe('PantallaService', () => {
  let service: PantallaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PantallaService],
    }).compile();

    service = module.get<PantallaService>(PantallaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
