import { Test, TestingModule } from '@nestjs/testing';
import { SaintService } from './saint.service';

describe('SaintService', () => {
  let service: SaintService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaintService],
    }).compile();

    service = module.get<SaintService>(SaintService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
