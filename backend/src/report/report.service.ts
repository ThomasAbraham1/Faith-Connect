import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as ExcelJS from 'exceljs';
import { User, UserDocument } from 'src/schemas/User.schema';
import { Events } from 'src/schemas/Events.schema';
import { Registration, RegistrationDocument } from 'src/schemas/Registration.schema';

export enum ReportType {
  USERS = 'USERS',
  EVENTS = 'EVENTS',
  REGISTRATIONS = 'REGISTRATIONS',
}

@Injectable()
export class ReportService {

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Events.name) private eventModel: Model<Events>,
    @InjectModel(Registration.name) private registrationModel: Model<RegistrationDocument>,
  ) { }

  async generateExcelReport(type: ReportType, filters: any, churchId: string): Promise<ExcelJS.Workbook> {
    const reportConfigs = {
      [ReportType.USERS]: { model: this.userModel, sheet: 'Members List', populate: [] },
      [ReportType.EVENTS]: { model: this.eventModel, sheet: 'Events List', populate: [] },
      [ReportType.REGISTRATIONS]: { model: this.registrationModel, sheet: 'Event Registrants', populate: ['memberId', 'eventId'] },
    };

    const config = reportConfigs[type];
    if (!config) throw new Error('Invalid report type');

    const { model, sheet, populate } = config;

    // 1. Fetch data with population
    const query = { churchId, ...filters };
    const data = await (model as any).find(query).populate(populate).limit(5000).exec();

    // 2. Initialize Workbook and Worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Called To Ascend ChMS';
    const worksheet = workbook.addWorksheet(sheet);

    // 3. Define Columns
    const excludedFields = ['__v', '_id', 'password', 'tenantId', 'churchId', 'responses', 'createdAt', 'updatedAt', ];
    const fieldNames = Object.keys(model.schema.paths).filter(
      (field) => !excludedFields.includes(field) && !field.includes('.'),
    );

    // Special handling for dynamic registration fields
    let dynamicFields: any[] = [];
    if (type === ReportType.REGISTRATIONS && filters.eventId) {
      const event = await this.eventModel.findById(filters.eventId);
      if (event && event.formFields) {
        dynamicFields = event.formFields;
      }
    }

    const baseColumns = fieldNames.map((field) => {
      const path = (model.schema.paths as any)[field];
      let header = field
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      if (path?.options?.ref && header.toLowerCase().endsWith('id')) {
        header = header.substring(0, header.length - 2).trim() + ' Name';
      }

      return { header, key: field, width: 25 };
    });

    const customColumns = dynamicFields.map(f => ({
      header: f.label,
      key: `custom_${f.name}`,
      width: 25
    }));

    worksheet.columns = [...baseColumns, ...customColumns];

    // 4. Style the Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { bottom: { style: 'medium', color: { argb: 'FF000000' } } };
    });
    headerRow.height = 25;

    // 5. Add the Data Rows
    data.forEach((item: any) => {
      const rowData = {};
      
      // Standard fields
      fieldNames.forEach((field) => {
        rowData[field] = this.formatValue(item[field]);
      });

      // Special handling for names/email/phone from responses if memberId is missing
      if (type === ReportType.REGISTRATIONS && !item.memberId && item.responses) {
        const resp = item.responses instanceof Map ? Object.fromEntries(item.responses) : item.responses;
        // If member name is N/A in standard fields, try pulling from responses
        if (rowData['memberId'] === 'N/A') {
          const first = resp.firstName || resp.first_name || '';
          const last = resp.lastName || resp.last_name || '';
          rowData['memberId'] = `${first} ${last}`.trim() || 'Guest';
        }
      }

      // Dynamic custom fields
      dynamicFields.forEach(f => {
        const resp = item.responses instanceof Map ? Object.fromEntries(item.responses) : item.responses;
        rowData[`custom_${f.name}`] = resp?.[f.name] ?? '';
      });

      worksheet.addRow(rowData);
    });

    return workbook;
  }

  /**
   * Helper to format cell values cleanly.
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) return 'N/A';
    if (value instanceof Date) return value.toLocaleDateString();

    if (typeof value === 'object' && !Array.isArray(value)) {
      if (value.firstName || value.lastName) {
        return `${value.firstName ?? ''} ${value.lastName ?? ''}`.trim();
      }
      if (value.eventName) return value.eventName;
      return value.name || value.title || value._id?.toString() || 'N/A';
    }

    return String(value);
  }
  create(createReportDto: CreateReportDto) {
    return 'This action adds a new report';
  }

  findAll() {
    return `This action returns all report`;
  }

  findOne(id: number) {
    return `This action returns a #${id} report`;
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }
}



