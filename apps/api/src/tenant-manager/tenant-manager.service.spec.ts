import { Test, TestingModule } from '@nestjs/testing';
import { TenantManagerService } from './tenant-manager.service';

describe('TenantManagerService', () => {
  let service: TenantManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantManagerService],
    }).compile();

    service = module.get<TenantManagerService>(TenantManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
