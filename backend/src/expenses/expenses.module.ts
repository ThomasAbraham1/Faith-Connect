import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Expense, ExpenseSchema } from 'src/schemas/Expense.schema';
import { StorageService } from 'src/storage/storage.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService, StorageService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
