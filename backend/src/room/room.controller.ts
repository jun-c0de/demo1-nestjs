import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomMaterialsDto } from './dto/update-room-materials.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @Post('floorplans/:floorplanId/rooms')
    create(
        @CurrentUser('userId') userId: string,
        @Param('floorplanId') floorplanId: string,
        @Body() dto: CreateRoomDto,
    ) {
        return this.roomService.create(userId, floorplanId, dto);
    }

    @Get('floorplans/:floorplanId/rooms')
    findAll(
        @CurrentUser('userId') userId: string,
        @Param('floorplanId') floorplanId: string,
    ) {
        return this.roomService.findAll(userId, floorplanId);
    }

    @Patch('rooms/:roomId/materials')
    updateMaterials(
        @CurrentUser('userId') userId: string,
        @Param('roomId') roomId: string,
        @Body() dto: UpdateRoomMaterialsDto,
    ) {
        return this.roomService.updateMaterials(userId, roomId, dto);
    }

    @Delete('rooms/:roomId')
    remove(
        @CurrentUser('userId') userId: string,
        @Param('roomId') roomId: string,
    ) {
        return this.roomService.remove(userId, roomId);
    }
}