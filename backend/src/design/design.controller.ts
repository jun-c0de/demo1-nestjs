import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { DesignService } from './design.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects/:projectId/designs')
@UseGuards(JwtAuthGuard)
export class DesignController {
  constructor(private readonly designService: DesignService) { }

  @Post()
  create(@Request() req, @Param('projectId') projectId: string, @Body() body: any) {
    return this.designService.createDesign(req.user.id, projectId, body);
  }

  @Get()
  findAll(@Request() req, @Param('projectId') projectId: string) {
    return this.designService.getDesignsByProject(req.user.id, projectId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('projectId') projectId: string, @Param('id') id: string) {
    return this.designService.getDesignById(req.user.id, projectId, id);
  }

  @Patch(':id')
  update(@Request() req, @Param('projectId') projectId: string, @Param('id') id: string, @Body() body: any) {
    return this.designService.saveDesign(req.user.id, projectId, id, body);
  }

  @Delete(':id')
  remove(@Request() req, @Param('projectId') projectId: string, @Param('id') id: string) {
    return this.designService.deleteDesign(req.user.id, projectId, id);
  }
}