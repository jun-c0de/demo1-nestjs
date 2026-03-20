import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Design } from './schemas/design.schema';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';

@Injectable()
export class DesignService {
  constructor(
    @InjectModel(Design.name) private readonly designModel: Model<Design>,
    @InjectModel('Project') private readonly projectModel: Model<any>,
  ) { }

  private toDesignDto(design: any) {
    return {
      id: design._id.toString(),
      project: design.project.toString(),
      owner: design.owner.toString(),
      name: design.name,
      room: design.room,
      editorData: design.editorData,
      createdAt: design.createdAt,
      updatedAt: design.updatedAt,
    };
  }

  async createDesign(userId: string, projectId: string, dto: CreateDesignDto) {
    const name = dto.name?.trim();

    if (!name) {
      throw new BadRequestException('디자인 이름을 입력해주세요.');
    }

    const project = await this.projectModel.findOne({
      _id: new Types.ObjectId(projectId),
      owner: new Types.ObjectId(userId),
    } as any);

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    if (project.status === 'trash') {
      throw new BadRequestException('휴지통 프로젝트에는 생성 불가합니다.');
    }

    const design = await this.designModel.create({
      project: project._id,
      owner: new Types.ObjectId(userId),
      name,
      room: {
        width: 3600,
        height: 2360,
        depth: 600,
      },
      editorData: {},
    });

    return this.toDesignDto(design);
  }

  async getDesignsByProject(userId: string, projectId: string) {
    const designs = await this.designModel
      .find({
        project: new Types.ObjectId(projectId),
        owner: new Types.ObjectId(userId),
      } as any)
      .sort({ updatedAt: -1 });

    return designs.map((design) => this.toDesignDto(design));
  }

  async getDesignById(userId: string, projectId: string, designId: string) {
    const design = await this.designModel.findOne({
      _id: new Types.ObjectId(designId),
      project: new Types.ObjectId(projectId),
      owner: new Types.ObjectId(userId),
    } as any);

    if (!design) {
      throw new NotFoundException('디자인을 찾을 수 없습니다.');
    }

    return this.toDesignDto(design);
  }

  async updateDesign(
    userId: string,
    projectId: string,
    designId: string,
    dto: UpdateDesignDto,
  ) {
    const design = await this.designModel.findOne({
      _id: new Types.ObjectId(designId),
      project: new Types.ObjectId(projectId),
      owner: new Types.ObjectId(userId),
    } as any);

    if (!design) {
      throw new NotFoundException('디자인을 찾을 수 없습니다.');
    }

    if (typeof dto.name === 'string') {
      const trimmedName = dto.name.trim();

      if (!trimmedName) {
        throw new BadRequestException('디자인 이름은 비워둘 수 없습니다.');
      }

      design.name = trimmedName;
    }

    if (dto.room) {
      design.room = {
        ...design.room,
        ...(dto.room.width !== undefined ? { width: dto.room.width } : {}),
        ...(dto.room.height !== undefined ? { height: dto.room.height } : {}),
        ...(dto.room.depth !== undefined ? { depth: dto.room.depth } : {}),
      };
    }

    if (dto.editorData !== undefined) {
      design.editorData = dto.editorData;
    }

    await design.save();
    return this.toDesignDto(design);
  }

  async deleteDesign(userId: string, projectId: string, designId: string) {
    const result = await this.designModel.deleteOne({
      _id: new Types.ObjectId(designId),
      project: new Types.ObjectId(projectId),
      owner: new Types.ObjectId(userId),
    } as any);

    if (result.deletedCount === 0) {
      throw new NotFoundException('디자인을 찾을 수 없습니다.');
    }

    return { id: designId };
  }
}