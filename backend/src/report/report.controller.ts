import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, Res } from '@nestjs/common';
import { ReportService, ReportType } from './report.service';
import { Response } from 'express';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';

@Controller('report')
@UseGuards(AuthenticatedGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @Get('fields/:type')
  async getReportFields(@Param('type') type: string, @Query() filters: any) {
    const reportType = type.toUpperCase() as ReportType;
    if (!Object.values(ReportType).includes(reportType)) {
      throw new Error('Invalid report type');
    }
    return this.reportService.getFields(reportType, filters);
  }

  @Get(':type/preview')
  async getReportPreview(
    @Request() req,
    @Param('type') type: string,
    @Query() query: any
  ) {
    const churchId = req.user.church._id;
    const reportType = type.toUpperCase() as ReportType;
    if (!Object.values(ReportType).includes(reportType)) {
      throw new Error('Invalid report type');
    }
    
    const { fields, ...filters } = query;
    const fieldsArray = fields ? fields.split(',').map((f: string) => f.trim()).filter(Boolean) : undefined;
    
    return this.reportService.getPreviewData(reportType, filters, churchId, fieldsArray);
  }
  @Get('users')
  async exportMembersToExcel(
    @Request() req,
    @Query() query: any,
    @Res() res: Response
  ) {
    // Isolate data by the logged-in user's church/tenant
    const churchId = req.user.church._id;
    const { fields, ...filters } = query;
    const fieldsArray = fields ? fields.split(',').map((f: string) => f.trim()).filter(Boolean) : undefined;


    // Generate the exact filename dynamically
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Users_Export_${dateStr}.xlsx`;

    // Set the proper HTTP headers so the browser triggers a file download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${fileName}`
    );

    try {
      // Get the workbook from the service
      const workbook = await this.reportService.generateExcelReport(ReportType.USERS, filters, churchId, fieldsArray);

      // Stream the workbook directly to the client
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      // If something goes wrong, reset the headers and send a standard error
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to generate export', error: error.message });
      }
    }
  }

  @Get('events')
  async exportEventsToExcel(
    @Request() req,
    @Query() query: any,
    @Res() res: Response
  ) {
    const churchId = req.user.church._id;
    const { fields, ...filters } = query;
    const fieldsArray = fields ? fields.split(',').map((f: string) => f.trim()).filter(Boolean) : undefined;
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Events_Export_${dateStr}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${fileName}`
    );

    try {
      const workbook = await this.reportService.generateExcelReport(ReportType.EVENTS, filters, churchId, fieldsArray);
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to generate export', error: error.message });
      }
    }
  }

  @Get('registrations')
  async exportRegistrationsToExcel(
    @Request() req,
    @Query() query: any,
    @Res() res: Response
  ) {
    const churchId = req.user.church._id;
    const { fields, ...filters } = query;
    const fieldsArray = fields ? fields.split(',').map((f: string) => f.trim()).filter(Boolean) : undefined;
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Registrations_Export_${dateStr}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${fileName}`
    );

    try {
      const workbook = await this.reportService.generateExcelReport(ReportType.REGISTRATIONS, filters, churchId, fieldsArray);
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to generate export', error: error.message });
      }
    }
  }

  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportService.create(createReportDto);
  }

  @Get()
  findAll() {
    return this.reportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportService.update(+id, updateReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportService.remove(+id);
  }
}
