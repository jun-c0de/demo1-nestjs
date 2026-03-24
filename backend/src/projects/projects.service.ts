import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Project } from './schemas/project.schema';
import { Design } from '../design/schemas/design.schema';
import { Floorplan } from '../floorplan/schemas/floorplan.schema';
import { Share } from '../share/schemas/share.schema';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(Design.name) private readonly designModel: Model<Design>,
    @InjectModel(Floorplan.name)
    private readonly floorplanModel: Model<Floorplan>,
    @InjectModel(Share.name) private readonly shareModel: Model<Share>,
  ) { }

  private toProjectDto(project: any, floorplanCount = 0) {
    return {
      id: project._id.toString(),
      owner: project.owner.toString(),
      title: project.title,
      status: project.status,
      projectType: project.projectType ?? 'residential',
      siteName: project.siteName ?? '',
      address: project.address ?? '',
      defaultUnit: project.defaultUnit ?? 'mm',
      thumbnailUrl: project.thumbnailUrl ?? '',
      floorplanCount,
      fileCount: floorplanCount,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  async createProject(userId: string, payload: any) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : '';
    if (!title) {
      throw new BadRequestException('프로젝트 이름을 입력해주세요.');
    }

    const projectType =
      ['residential', 'office', 'commercial'].includes(payload?.projectType)
        ? payload.projectType
        : 'residential';

    const defaultUnit =
      ['mm', 'cm', 'm'].includes(payload?.defaultUnit)
        ? payload.defaultUnit
        : 'mm';

    const project = await this.projectModel.create({
      owner: new Types.ObjectId(userId),
      title,
      status: 'active',
      projectType,
      siteName:
        typeof payload?.siteName === 'string' ? payload.siteName.trim() : '',
      address:
        typeof payload?.address === 'string' ? payload.address.trim() : '',
      defaultUnit,
      thumbnailUrl:
        typeof payload?.thumbnailUrl === 'string'
          ? payload.thumbnailUrl.trim()
          : '',
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

    const floorplanCounts = await this.floorplanModel.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: '$projectId', count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    floorplanCounts.forEach((item: any) => {
      countMap[item._id.toString()] = item.count;
    });

    const result = projects.map((p: any) =>
      this.toProjectDto(p, countMap[p._id.toString()] || 0),
    );

    if (sort === 'fileCount_desc' || sort === 'floorplanCount_desc') {
      result.sort((a, b) => b.floorplanCount - a.floorplanCount);
    }

    return result;
  }

  async getProjectCounts(userId: string) {
    const owner = new Types.ObjectId(userId);

    const [active, completed, trash, sharedWithMe, sharedByMe] =
      await Promise.all([
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

    const floorplanCount = await this.floorplanModel.countDocuments({
      projectId: project._id,
    } as any);

    return this.toProjectDto(project, floorplanCount);
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

    const floorplanCount = await this.floorplanModel.countDocuments({
      projectId: project._id,
    } as any);

    return this.toProjectDto(project, floorplanCount);
  }

  async updateProjectMeta(userId: string, projectId: string, payload: any) {
    const updateData: any = {};

    if (payload.projectType !== undefined) {
      if (
        !['residential', 'office', 'commercial'].includes(payload.projectType)
      ) {
        throw new BadRequestException('유효하지 않은 프로젝트 유형입니다.');
      }
      updateData.projectType = payload.projectType;
    }

    if (payload.defaultUnit !== undefined) {
      if (!['mm', 'cm', 'm'].includes(payload.defaultUnit)) {
        throw new BadRequestException('유효하지 않은 기본 단위입니다.');
      }
      updateData.defaultUnit = payload.defaultUnit;
    }

    if (payload.siteName !== undefined) {
      updateData.siteName =
        typeof payload.siteName === 'string' ? payload.siteName.trim() : '';
    }

    if (payload.address !== undefined) {
      updateData.address =
        typeof payload.address === 'string' ? payload.address.trim() : '';
    }

    if (payload.thumbnailUrl !== undefined) {
      updateData.thumbnailUrl =
        typeof payload.thumbnailUrl === 'string'
          ? payload.thumbnailUrl.trim()
          : '';
    }

    const project = await this.projectModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(projectId),
        owner: new Types.ObjectId(userId),
      } as any,
      updateData,
      { new: true },
    );

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    const floorplanCount = await this.floorplanModel.countDocuments({
      projectId: project._id,
    } as any);

    return this.toProjectDto(project, floorplanCount);
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

    const floorplanCount = await this.floorplanModel.countDocuments({
      projectId: project._id,
    } as any);

    return this.toProjectDto(project, floorplanCount);
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
      projectType: source.projectType ?? 'residential',
      siteName: source.siteName ?? '',
      address: source.address ?? '',
      defaultUnit: source.defaultUnit ?? 'mm',
      thumbnailUrl: source.thumbnailUrl ?? '',
    });

    const sourceFloorplans = await this.floorplanModel.find({
      projectId: source._id,
    } as any);

    if (sourceFloorplans.length > 0) {
      const duplicatedFloorplans = sourceFloorplans.map((fp: any) => ({
        projectId: duplicated._id,
        owner: new Types.ObjectId(userId),
        name: `${fp.name} 복사본`,
        originalFileUrl: fp.originalFileUrl,
        fileType: fp.fileType,
        pageIndex: fp.pageIndex ?? null,
        scaleRatio: fp.scaleRatio ?? null,
        scaleUnit: fp.scaleUnit ?? 'mm',
        calibrationPoints: fp.calibrationPoints ?? [],
        width: fp.width ?? 0,
        height: fp.height ?? 0,
        status: fp.status ?? 'uploaded',
      }));

      await this.floorplanModel.insertMany(duplicatedFloorplans);
    }

    return this.toProjectDto(duplicated, sourceFloorplans.length);
  }

  async deleteProjectForever(userId: string, projectId: string) {
    const project = await this.projectModel.findOne({
      _id: new Types.ObjectId(projectId),
      owner: new Types.ObjectId(userId),
    } as any);

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    const floorplans = await this.floorplanModel.find({
      projectId: project._id,
      owner: new Types.ObjectId(userId),
    } as any);

    const floorplanIds = floorplans.map((fp: any) => fp._id);

    await Promise.all([
      this.projectModel.deleteOne({ _id: project._id }),
      this.designModel.deleteMany({ project: project._id } as any),
      this.floorplanModel.deleteMany({ projectId: project._id } as any),
      this.shareModel.deleteMany({ project: project._id } as any),
      floorplanIds.length > 0
        ? this.projectModel.db.collection('rooms').deleteMany({
          floorplanId: { $in: floorplanIds },
        })
        : Promise.resolve(),
    ]);

    return { id: projectId };
  }
}