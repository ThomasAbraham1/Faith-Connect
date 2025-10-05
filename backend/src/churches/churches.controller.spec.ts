import { Test, TestingModule } from '@nestjs/testing';
import { ChurchesController } from './churches.controller';
import { ChurchesService } from './churches.service';

describe('ChurchesController', () => {
  let controller: ChurchesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChurchesController],
      providers: [ChurchesService],
    }).compile();

    controller = module.get<ChurchesController>(ChurchesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
