import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() body: any) {
    return this.projectService.createProject(userId, body);
  }

  @Get()
  findAll(@CurrentUser('userId') userId: string, @Query() query: any) {
    return this.projectService.getProjects(userId, query);
  }

  @Get('counts')
  getCounts(@CurrentUser('userId') userId: string) {
    return this.projectService.getProjectCounts(userId);
  }

  @Get(':id')
  findOne(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.projectService.getProjectById(userId, id);
  }

  @Patch(':id/title')
  rename(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body('title') title: string,
  ) {
    return this.projectService.renameProject(userId, id, title);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.projectService.updateProjectStatus(userId, id, status);
  }

  @Post(':id/duplicate')
  duplicate(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.projectService.duplicateProject(userId, id);
  }

  @Delete(':id')
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.projectService.deleteProjectForever(userId, id);
  }
}