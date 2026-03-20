import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Project } from './schemas/project.schema';
import { Design } from '../design/schemas/design.schema';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(Design.name) private readonly designModel: Model<Design>,
    @InjectModel('Share') private readonly shareModel: Model<any>,
  ) { }

  private toProjectDto(project: any, fileCount = 0) {
    return {
      id: project._id.toString(),
      owner: project.owner.toString(),
      title: project.title,
      status: project.status,
      fileCount,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  async createProject(userId: string, payload: any) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : '';
    if (!title) {
      throw new BadRequestException('프로젝트 이름을 입력해주세요.');
    }

    const project = await this.projectModel.create({
      owner: new Types.ObjectId(userId),
      title,
      status: 'active',
    });

    return this.toProjectDto(project, 0);
  }

  async getProjects(userId: string, query: any) {
    const status = ['active', 'completed', 'trash'].includes(query.status)
      ? query.status
      : 'active';
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    const sort = query.sort || 'updatedAt_desc';

    const filter: any = {
      owner: new Types.ObjectId(userId),
      status,
    };

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    let sortOption: any = { updatedAt: -1 };
    if (sort === 'name_asc') sortOption = { title: 1 };
    if (sort === 'createdAt_desc') sortOption = { createdAt: -1 };

    const projects = await this.projectModel.find(filter).sort(sortOption);
    const projectIds = projects.map((p) => p._id);

    const designCounts = await this.designModel.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$project', count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    designCounts.forEach((item: any) => {
      countMap[item._id.toString()] = item.count;
    });

    const result = projects.map((p: any) =>
      this.toProjectDto(p, countMap[p._id.toString()] || 0),
    );

    if (sort === 'fileCount_desc') {
      result.sort((a, b) => b.fileCount - a.fileCount);
    }

    return result;
  }

  async getProjectCounts(userId: string) {
    const owner = new Types.ObjectId(userId);

    const [active, completed, trash, sharedWithMe, sharedByMe] = await Promise.all([
      this.projectModel.countDocuments({ owner, status: 'active' } as any),
      this.projectModel.countDocuments({ owner, status: 'completed' } as any),
      this.projectModel.countDocuments({ owner, status: 'trash' } as any),
      this.shareModel.countDocuments({ sharedWith: owner } as any),
      this.shareModel.countDocuments({ owner } as any),
    ]);

    return {
      active,
      completed,
      trash,
      sharedWithMe,
      sharedByMe,
    };
  }

  async getProjectById(userId: string, projectId: string) {
    const project = await this.projectModel.findOne({
      _id: new Types.ObjectId(projectId),
      owner: new Types.ObjectId(userId),
    } as any);

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    const fileCount = await this.designModel.countDocuments({
      project: project._id,
    } as any);

    return this.toProjectDto(project, fileCount);
  }

  async renameProject(userId: string, projectId: string, title: string) {
    const nextTitle = typeof title === 'string' ? title.trim() : '';

    if (!nextTitle) {
      throw new BadRequestException('프로젝트 이름을 입력해주세요.');
    }

    const project = await this.projectModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(projectId),
        owner: new Types.ObjectId(userId),
      } as any,
      { title: nextTitle },
      { new: true },
    );

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    const fileCount = await this.designModel.countDocuments({
      project: project._id,
    } as any);

    return this.toProjectDto(project, fileCount);
  }

  async updateProjectStatus(userId: string, projectId: string, status: string) {
    if (!['active', 'completed', 'trash'].includes(status)) {
      throw new BadRequestException('유효하지 않은 상태입니다.');
    }

    const project = await this.projectModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(projectId),
        owner: new Types.ObjectId(userId),
      } as any,
      { status },
      { new: true },
    );

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    const fileCount = await this.designModel.countDocuments({
      project: project._id,
    } as any);

    return this.toProjectDto(project, fileCount);
  }

  async duplicateProject(userId: string, projectId: string) {
    const source = await this.projectModel.findOne({
      _id: new Types.ObjectId(projectId),
      owner: new Types.ObjectId(userId),
    } as any);

    if (!source) {
      throw new NotFoundException('원본 프로젝트를 찾을 수 없습니다.');
    }

    const duplicated = await this.projectModel.create({
      owner: new Types.ObjectId(userId),
      title: `${source.title} 복사본`,
      status: 'active',
    });

    const sourceDesigns = await this.designModel.find({
      project: source._id,
    } as any);

    if (sourceDesigns.length > 0) {
      const duplicatedDesigns = sourceDesigns.map((d: any) => ({
        project: duplicated._id,
        owner: new Types.ObjectId(userId),
        name: `${d.name} 복사본`,
        room: d.room,
        editorData: d.editorData,
      }));

      await this.designModel.insertMany(duplicatedDesigns);
    }

    return this.toProjectDto(duplicated, sourceDesigns.length);
  }

  async deleteProjectForever(userId: string, projectId: string) {
    const project = await this.projectModel.findOne({
      _id: new Types.ObjectId(projectId),
      owner: new Types.ObjectId(userId),
    } as any);

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    await Promise.all([
      this.projectModel.deleteOne({ _id: project._id }),
      this.designModel.deleteMany({ project: project._id } as any),
      this.shareModel.deleteMany({ project: project._id } as any),
    ]);

    return { id: projectId };
  }
}