import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() req: any,
    @Body() body: { name: string; description?: string },
  ) {
    return this.projectsService.create(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findMyProjects(@Req() req: any) {
    return this.projectsService.findAllByUser(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }
}