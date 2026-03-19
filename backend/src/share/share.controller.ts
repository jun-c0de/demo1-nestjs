import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ShareService } from './share.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('shares')
@UseGuards(JwtAuthGuard)
export class ShareController {
  constructor(private readonly shareService: ShareService) { }

  @Get('with-me')
  getSharedWithMe(@Request() req, @Query() query: any) {
    return this.shareService.getSharedWithMe(req.user.id, query);
  }

  @Get('project/:projectId')
  getProjectShares(@Request() req, @Param('projectId') projectId: string) {
    return this.shareService.getProjectShares(req.user.id, projectId);
  }

  @Post(':projectId')
  share(@Request() req, @Param('projectId') projectId: string, @Body() body: any) {
    return this.shareService.shareProject(req.user.id, projectId, body);
  }

  @Delete(':shareId')
  unshare(@Request() req, @Param('shareId') shareId: string) {
    return this.shareService.unshareProject(req.user.id, shareId);
  }
}