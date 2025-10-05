import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';
import { Church } from './entities/church.entity';

@Controller('churches')
export class ChurchesController {
  constructor(private readonly churchesService: ChurchesService) { }

  @Post()
  create(@Body() createChurchDto: CreateChurchDto) {
    return this.churchesService.create(createChurchDto);
  }

  @Get()
  findAll() {
    return this.churchesService.findAll();
  }

  @Get('roles')
  findAllRoles(@Req() req) {
    const church = req.user.church;
    console.log(church)
    return church.roles
    // return this.churchesService.findAllRoles();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.churchesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChurchDto: UpdateChurchDto) {
    return this.churchesService.update(+id, updateChurchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.churchesService.remove(id);
  }
}
