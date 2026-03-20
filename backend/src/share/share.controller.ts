import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShareService } from './share.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('shares')
@UseGuards(JwtAuthGuard)
export class ShareController {
  constructor(private readonly shareService: ShareService) { }

  @Get('with-me')
  getSharedWithMe(@CurrentUser('userId') userId: string, @Query() query: any) {
    return this.shareService.getSharedWithMe(userId, query);
  }

  @Get('by-me')
  getSharedByMe(@CurrentUser('userId') userId: string, @Query() query: any) {
    return this.shareService.getSharedByMe(userId, query);
  }

  @Get('project/:projectId')
  getProjectShares(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.shareService.getProjectShares(userId, projectId);
  }

  @Post(':projectId')
  share(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: any,
  ) {
    return this.shareService.shareProject(userId, projectId, body);
  }

  @Delete(':shareId')
  unshare(
    @CurrentUser('userId') userId: string,
    @Param('shareId') shareId: string,
  ) {
    return this.shareService.unshareProject(userId, shareId);
  }
}