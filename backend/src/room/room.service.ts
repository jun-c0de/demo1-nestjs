import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Room } from './schemas/room.schema';
import { Floorplan } from '../floorplan/schemas/floorplan.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomMaterialsDto } from './dto/update-room-materials.dto';

@Injectable()
export class RoomService {
    constructor(
        @InjectModel(Room.name)
        private readonly roomModel: Model<Room>,
        @InjectModel(Floorplan.name)
        private readonly floorplanModel: Model<Floorplan>,
    ) { }

    private toDto(doc: any) {
        return {
            id: doc._id.toString(),
            projectId: doc.projectId.toString(),
            floorplanId: doc.floorplanId.toString(),
            owner: doc.owner.toString(),
            name: doc.name,
            type: doc.type,
            polygon: doc.polygon,
            area: doc.area,
            perimeter: doc.perimeter,
            ceilingHeight: doc.ceilingHeight,
            floorMaterialId: doc.floorMaterialId,
            wallMaterialId: doc.wallMaterialId,
            ceilingMaterialId: doc.ceilingMaterialId,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }

    async create(userId: string, floorplanId: string, dto: CreateRoomDto) {
        const floorplan = await this.floorplanModel.findOne({
            _id: new Types.ObjectId(floorplanId),
            owner: new Types.ObjectId(userId),
        } as any);

        if (!floorplan) {
            throw new NotFoundException('도면을 찾을 수 없습니다.');
        }

        const doc = await this.roomModel.create({
            projectId: floorplan.projectId,
            floorplanId: floorplan._id,
            owner: new Types.ObjectId(userId),
            name: dto.name.trim(),
            type: dto.type ?? 'etc',
            polygon: dto.polygon ?? [],
            area: dto.area ?? 0,
            perimeter: dto.perimeter ?? 0,
            ceilingHeight: dto.ceilingHeight ?? 2400,
        });

        return this.toDto(doc);
    }

    async findAll(userId: string, floorplanId: string) {
        return (
            await this.roomModel
                .find({
                    floorplanId: new Types.ObjectId(floorplanId),
                    owner: new Types.ObjectId(userId),
                } as any)
                .sort({ updatedAt: -1 })
        ).map((doc) => this.toDto(doc));
    }

    async updateMaterials(
        userId: string,
        roomId: string,
        dto: UpdateRoomMaterialsDto,
    ) {
        const doc = await this.roomModel.findOne({
            _id: new Types.ObjectId(roomId),
            owner: new Types.ObjectId(userId),
        } as any);

        if (!doc) {
            throw new NotFoundException('방을 찾을 수 없습니다.');
        }

        if (dto.floorMaterialId !== undefined) doc.floorMaterialId = dto.floorMaterialId;
        if (dto.wallMaterialId !== undefined) doc.wallMaterialId = dto.wallMaterialId;
        if (dto.ceilingMaterialId !== undefined) doc.ceilingMaterialId = dto.ceilingMaterialId;

        await doc.save();
        return this.toDto(doc);
    }

    async remove(userId: string, roomId: string) {
        const result = await this.roomModel.deleteOne({
            _id: new Types.ObjectId(roomId),
            owner: new Types.ObjectId(userId),
        } as any);

        if (result.deletedCount === 0) {
            throw new NotFoundException('방을 찾을 수 없습니다.');
        }

        return { id: roomId };
    }
}