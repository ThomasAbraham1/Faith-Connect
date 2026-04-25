import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExpensesService } from './expenses.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { StorageService } from 'src/storage/storage.service';

@UseGuards(AuthenticatedGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('receipt'))
  async create(
    @Req() req,
    @Body() createExpenseDto: CreateExpenseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const churchId = req.user.church._id;
    const userId = req.user._id;

    if (file) {
      const key = `receipts/${churchId}/${Date.now()}-${file.originalname}`;
      const url = await this.storageService.uploadFile(file.buffer, key, file.mimetype);
      createExpenseDto.receiptUrl = url;
    }

    return this.expensesService.create(createExpenseDto, churchId, userId);
  }

  @Get()
  findAllByGroup(@Req() req, @Query('groupId') groupId: string) {
    const churchId = req.user.church._id;
    return this.expensesService.findAllByGroup(churchId, groupId);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    const churchId = req.user.church._id;
    return this.expensesService.remove(id, churchId);
  }
}
