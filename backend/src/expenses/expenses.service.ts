import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense, ExpenseDocument } from 'src/schemas/Expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, churchId: string, userId: string): Promise<ExpenseDocument> {
    const createdExpense = new this.expenseModel({
      ...createExpenseDto,
      amount: Number(createExpenseDto.amount),
      churchId,
      submittedBy: userId,
    });
    return createdExpense.save();
  }

  async findAllByGroup(churchId: string, groupId: string): Promise<ExpenseDocument[]> {
    return this.expenseModel
      .find({ churchId, groupId })
      .populate('submittedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async remove(id: string, churchId: string): Promise<any> {
    const result = await this.expenseModel.findOneAndDelete({ _id: id, churchId }).exec();
    if (!result) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return result;
  }
}
