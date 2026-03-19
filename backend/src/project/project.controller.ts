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
  Request
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  // 1. 프로젝트 생성
  @Post()
  async create(@Request() req, @Body() body: any) {
    // JwtStrategy에서 리턴한 값이 req.user에 들어있습니다. 
    // 보통 id가 아니라 _id 또는 sub인 경우가 많으니 확인이 필요합니다.
    const userId = req.user.userId || req.user.sub || req.user.id;
    return this.projectService.createProject(userId, body);
  }

  // 2. 프로젝트 목록 조회 (검색/필터 포함)
  @Get()
  async findAll(@Request() req, @Query() query: any) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    return this.projectService.getProjects(userId, query);
  }

  // 3. 프로젝트 상태 업데이트
  @Patch(':id/status')
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    return this.projectService.updateProjectStatus(userId, id, status);
  }

  // 4. 프로젝트 복제
  @Post(':id/duplicate')
  async duplicate(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    return this.projectService.duplicateProject(userId, id);
  }

  // 5. 프로젝트 영구 삭제
  @Delete(':id/forever')
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    return this.projectService.deleteProjectForever(userId, id);
  }
}