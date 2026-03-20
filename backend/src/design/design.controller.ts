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
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';

@Controller('projects/:projectId/designs')
@UseGuards(JwtAuthGuard)
export class DesignController {
  constructor(private readonly designService: DesignService) { }

  @Post()
  create(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: CreateDesignDto,
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
    @Body() body: UpdateDesignDto,
  ) {
    return this.designService.updateDesign(userId, projectId, id, body);
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