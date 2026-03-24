import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Floorplan } from './schemas/floorplan.schema';
import { Project } from '../projects/schemas/project.schema';
import { CreateFloorplanDto } from './dto/create-floorplan.dto';
import { CalibrateFloorplanDto } from './dto/calibrate-floorplan.dto';

@Injectable()
export class FloorplanService {
    constructor(
        @InjectModel(Floorplan.name)
        private readonly floorplanModel: Model<Floorplan>,
        @InjectModel(Project.name)
        private readonly projectModel: Model<Project>,
    ) { }

    private toDto(doc: any) {
        return {
            id: doc._id.toString(),
            projectId: doc.projectId.toString(),
            owner: doc.owner.toString(),
            name: doc.name,
            originalFileUrl: doc.originalFileUrl,
            fileType: doc.fileType,
            pageIndex: doc.pageIndex,
            scaleRatio: doc.scaleRatio,
            scaleUnit: doc.scaleUnit,
            calibrationPoints: doc.calibrationPoints,
            width: doc.width,
            height: doc.height,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }

    async create(userId: string, projectId: string, dto: CreateFloorplanDto) {
        const project = await this.projectModel.findOne({
            _id: new Types.ObjectId(projectId),
            owner: new Types.ObjectId(userId),
        } as any);

        if (!project) {
            throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
        }

        const doc = await this.floorplanModel.create({
            projectId: project._id,
            owner: new Types.ObjectId(userId),
            name: dto.name.trim(),
            originalFileUrl: dto.originalFileUrl,
            fileType: dto.fileType,
            pageIndex: dto.pageIndex ?? null,
            width: dto.width ?? 0,
            height: dto.height ?? 0,
            status: 'uploaded',
        });

        return this.toDto(doc);
    }

    async findAll(userId: string, projectId: string) {
        return (
            await this.floorplanModel
                .find({
                    projectId: new Types.ObjectId(projectId),
                    owner: new Types.ObjectId(userId),
                } as any)
                .sort({ updatedAt: -1 })
        ).map((doc) => this.toDto(doc));
    }

    async findOne(userId: string, floorplanId: string) {
        const doc = await this.floorplanModel.findOne({
            _id: new Types.ObjectId(floorplanId),
            owner: new Types.ObjectId(userId),
        } as any);

        if (!doc) {
            throw new NotFoundException('도면을 찾을 수 없습니다.');
        }

        return this.toDto(doc);
    }

    async calibrate(
        userId: string,
        floorplanId: string,
        dto: CalibrateFloorplanDto,
    ) {
        if (!dto.calibrationPoints || dto.calibrationPoints.length < 2) {
            throw new BadRequestException('보정 포인트는 최소 2개가 필요합니다.');
        }

        const doc = await this.floorplanModel.findOne({
            _id: new Types.ObjectId(floorplanId),
            owner: new Types.ObjectId(userId),
        } as any);

        if (!doc) {
            throw new NotFoundException('도면을 찾을 수 없습니다.');
        }

        doc.calibrationPoints = dto.calibrationPoints;
        doc.scaleRatio = dto.scaleRatio;
        doc.scaleUnit = dto.scaleUnit;
        doc.status = 'calibrated';

        await doc.save();
        return this.toDto(doc);
    }
}