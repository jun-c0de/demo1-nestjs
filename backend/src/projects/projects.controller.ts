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
import { ApiBearerAuth } from '@nestjs/swagger';
import { ProjectService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { RenameProjectDto } from './dto/rename-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { UpdateProjectMetaDto } from './dto/update-project-meta.dto';

@ApiBearerAuth('access-token')
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Post()
  create(
    @CurrentUser('userId') userId: string,
    @Body() body: CreateProjectDto,
  ) {
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
    @Body() body: RenameProjectDto,
  ) {
    return this.projectService.renameProject(userId, id, body.title);
  }

  @Patch(':id/meta')
  updateMeta(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() body: UpdateProjectMetaDto,
  ) {
    return this.projectService.updateProjectMeta(userId, id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() body: UpdateProjectStatusDto,
  ) {
    return this.projectService.updateProjectStatus(userId, id, body.status);
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