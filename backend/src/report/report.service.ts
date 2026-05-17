import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import * as ExcelJS from 'exceljs';
import { User, UserDocument } from 'src/schemas/User.schema';
import { Events, EventsSchema } from 'src/schemas/Events.schema';
import { Registration, RegistrationDocument } from 'src/schemas/Registration.schema';
import { EventsService } from 'src/events/events.service';

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
    private eventsService: EventsService,
  ) { }

  async generateExcelReport(type: ReportType, filters: any, churchId: string, fields?: string[]): Promise<ExcelJS.Workbook> {
    const reportConfigs = {
      [ReportType.USERS]: { model: this.userModel, sheet: 'Members List', populate: [] },
      [ReportType.EVENTS]: { model: this.eventModel, sheet: 'Events List', populate: [] },
      [ReportType.REGISTRATIONS]: { model: this.registrationModel, sheet: 'Event Registrants', populate: ['memberId', 'eventId'] },
    };

    const config = reportConfigs[type];
    if (!config) throw new Error('Invalid report type');

    const { model, sheet, populate } = config;

    // 1. Fetch data with population
    let data;
    if (type === ReportType.REGISTRATIONS && filters.eventId) {
      data = await this.eventsService.getEventAttendees(filters.eventId);
    } else {
      const query = { churchId, ...filters };
      data = await (model as any).find(query).populate(populate).limit(5000).exec();
    }

    // 2. Initialize Workbook and Worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Faith Connect ChMS';
    const worksheet = workbook.addWorksheet(sheet);

    // 3. Define Columns
    const availableFields = await this.getFields(type, filters);
    const selectedFields = fields && fields.length > 0
      ? availableFields.filter(f => fields.includes(f.key))
      : availableFields;

    worksheet.columns = selectedFields.map(f => ({
      header: f.label,
      key: f.key,
      width: 25
    }));

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

      selectedFields.forEach((field) => {
        if (field.key.startsWith('custom_')) {
          const name = field.key.replace('custom_', '');
          const resp = item.responses instanceof Map ? Object.fromEntries(item.responses) : item.responses;
          rowData[field.key] = resp?.[name] ?? '';
        } else {
          rowData[field.key] = this.formatValue(item[field.key]);

          // Use flat attendee data if available
          if (type === ReportType.REGISTRATIONS && field.key === 'memberId') {
            if (item.firstName || item.lastName) {
              rowData['memberId'] = `${item.firstName || ''} ${item.lastName || ''}`.trim();
            } else if (rowData['memberId'] === 'N/A' && item.responses) {
              const resp = item.responses instanceof Map ? Object.fromEntries(item.responses) : item.responses;
              const first = resp.firstName || resp.first_name || '';
              const last = resp.lastName || resp.last_name || '';
              rowData['memberId'] = `${first} ${last}`.trim() || 'Guest';
            }
          }
        }
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

  async getFields(type: ReportType, filters: any): Promise<{ key: string, label: string }[]> {
    const reportConfigs = {
      [ReportType.USERS]: { model: this.userModel },
      [ReportType.EVENTS]: { model: this.eventModel },
      [ReportType.REGISTRATIONS]: { model: this.registrationModel },
    };

    const config = reportConfigs[type];
    if (!config) throw new Error('Invalid report type');

    const { model } = config;
    const excludedFields = ['__v', '_id', 'password', 'tenantId', 'churchId', 'responses', 'createdAt', 'updatedAt'];
    const fieldNames = Object.keys(model.schema.paths).filter(
      (field) => !excludedFields.includes(field) && !field.includes('.'),
    );

    const baseFields = fieldNames.map((field) => {
      const path = (model.schema.paths as any)[field];
      let header = field
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      if (path?.options?.ref && header.toLowerCase().endsWith('id')) {
        header = header.substring(0, header.length - 2).trim() + ' Name';
      }

      return { key: field, label: header };
    });

    let customFields: any[] = [];
    // TODO: Consider generalizing this instead of hardcoding REGISTRATIONS.
    // Question: Should we open this to anything with custom fields? How do we dynamically qualify if an entity has custom fields?
    if (type === ReportType.REGISTRATIONS && filters.eventId && isValidObjectId(filters.eventId)) {
      const event = await this.eventModel.findById(filters.eventId);
      if (event && event.formFields) {
        customFields = event.formFields.map(f => ({
          key: `custom_${f.name}`,
          label: f.label
        }));
      }
    }

    return [...baseFields, ...customFields];
  }

  async getPreviewData(type: ReportType, filters: any, churchId: string, fields?: string[]) {
    const reportConfigs = {
      [ReportType.USERS]: { model: this.userModel, populate: [] },
      [ReportType.EVENTS]: { model: this.eventModel, populate: [] },
      [ReportType.REGISTRATIONS]: { model: this.registrationModel, populate: ['memberId', 'eventId'] },
    };

    const config = reportConfigs[type];
    if (!config) throw new Error('Invalid report type');

    const { model, populate } = config;
    let data;
    if (type === ReportType.REGISTRATIONS && filters.eventId) {
      data = await this.eventsService.getEventAttendees(filters.eventId);
    } else {
      const query = { churchId, ...filters };
      data = await (model as any).find(query).populate(populate).limit(50).exec();
    }

    const availableFields = await this.getFields(type, filters);
    const selectedFields = fields && fields.length > 0
      ? availableFields.filter(f => fields.includes(f.key))
      : availableFields;

    return data.map((item: any) => {
      const row = {};
      selectedFields.forEach(f => {
        // Use the human-readable label as the key so DynamicTable renders friendly column headers
        const columnKey = f.label;

        if (f.key.startsWith('custom_')) {
          const name = f.key.replace('custom_', '');
          const resp = item.responses instanceof Map ? Object.fromEntries(item.responses) : item.responses;
          row[columnKey] = resp?.[name] ?? '';
        } else {
          row[columnKey] = this.formatValue(item[f.key]);

          // Special fallback for member name in registrations
          if (type === ReportType.REGISTRATIONS && f.key === 'memberId') {
            if (item.firstName || item.lastName) {
              row[columnKey] = `${item.firstName || ''} ${item.lastName || ''}`.trim();
            } else if (row[columnKey] === 'N/A' && item.responses) {
              const resp = item.responses instanceof Map ? Object.fromEntries(item.responses) : item.responses;
              const fullName = resp.name || '';
              row[columnKey] = `${fullName}`.trim() || 'Guest';
            }
          }
        }
      });
      return row;
    });
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



