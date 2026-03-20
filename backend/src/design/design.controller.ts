import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DesignService } from './design.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('projects/:projectId/designs')
@UseGuards(JwtAuthGuard)
export class DesignController {
  constructor(private readonly designService: DesignService) { }

  @Post()
  create(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: any,
  ) {
    return this.designService.createDesign(userId, projectId, body);
  }

  @Get()
  findAll(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.designService.getDesignsByProject(userId, projectId);
  }

  @Get(':id')
  findOne(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    return this.designService.getDesignById(userId, projectId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.designService.saveDesign(userId, projectId, id, body);
  }

  @Delete(':id')
  remove(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    return this.designService.deleteDesign(userId, projectId, id);
  }
}