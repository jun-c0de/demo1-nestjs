import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FloorplanService } from './floorplan.service';
import { CreateFloorplanDto } from './dto/create-floorplan.dto';
import { CalibrateFloorplanDto } from './dto/calibrate-floorplan.dto';

import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller()
@UseGuards(JwtAuthGuard)
export class FloorplanController {
    constructor(private readonly floorplanService: FloorplanService) { }

    @Post('projects/:projectId/floorplans')
    create(
        @CurrentUser('userId') userId: string,
        @Param('projectId') projectId: string,
        @Body() dto: CreateFloorplanDto,
    ) {
        return this.floorplanService.create(userId, projectId, dto);
    }

    @Get('projects/:projectId/floorplans')
    findAll(
        @CurrentUser('userId') userId: string,
        @Param('projectId') projectId: string,
    ) {
        return this.floorplanService.findAll(userId, projectId);
    }

    @Get('floorplans/:floorplanId')
    findOne(
        @CurrentUser('userId') userId: string,
        @Param('floorplanId') floorplanId: string,
    ) {
        return this.floorplanService.findOne(userId, floorplanId);
    }

    @Patch('floorplans/:floorplanId/calibrate')
    calibrate(
        @CurrentUser('userId') userId: string,
        @Param('floorplanId') floorplanId: string,
        @Body() dto: CalibrateFloorplanDto,
    ) {
        return this.floorplanService.calibrate(userId, floorplanId, dto);
    }
}