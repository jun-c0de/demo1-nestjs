import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Share } from './schemas/share.schema';

@Injectable()
export class ShareService {
  constructor(
    @InjectModel(Share.name) private shareModel: Model<Share>,
    @InjectModel('Project') private projectModel: Model<any>,
    @InjectModel('User') private userModel: Model<any>,
  ) { }

  private toShareDto(share: any) {
    return {
      id: share._id.toString(),
      permission: share.permission,
      createdAt: share.createdAt,
      sharedWith: share.sharedWith ? {
        id: share.sharedWith._id.toString(),
        name: share.sharedWith.name,
        email: share.sharedWith.email,
      } : null,
      owner: share.owner ? {
        id: share.owner._id.toString(),
        name: share.owner.name,
        email: share.owner.email,
      } : null,
      project: share.project ? {
        id: share.project._id.toString(),
        title: share.project.title,
        status: share.project.status,
        createdAt: share.project.createdAt,
        updatedAt: share.project.updatedAt,
      } : null,
    };
  }

  async shareProject(userId: string, projectId: string, payload: any) {
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    const permission = payload.permission === 'editor' ? 'editor' : 'viewer';

    if (!email) throw new BadRequestException('사용자 이메일을 입력해주세요.');

    const project = await this.projectModel.findOne({
      _id: new Types.ObjectId(projectId),
      owner: new Types.ObjectId(userId)
    } as any);

    if (!project) throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    if (project.status === 'trash') throw new BadRequestException('휴지통 프로젝트는 공유할 수 없습니다.');

    const targetUser = await this.userModel.findOne({ email });
    if (!targetUser) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    if (targetUser._id.toString() === userId) throw new BadRequestException('본인에게는 공유할 수 없습니다.');

    // 기존 공유 확인 후 업데이트 또는 생성
    const share = await this.shareModel.findOneAndUpdate(
      { project: project._id, sharedWith: targetUser._id } as any,
      { owner: new Types.ObjectId(userId), permission },
      { upsert: true, new: true }
    ).populate('sharedWith', 'name email').populate('owner', 'name email').populate('project');

    return this.toShareDto(share);
  }

  async getProjectShares(userId: string, projectId: string) {
    const shares = await this.shareModel.find({
      project: new Types.ObjectId(projectId),
      owner: new Types.ObjectId(userId)
    } as any)
      .populate('sharedWith', 'name email')
      .populate('owner', 'name email')
      .populate('project');

    return shares.map(s => this.toShareDto(s));
  }

  async getSharedWithMe(userId: string, query: any) {
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    const sort = query.sort || 'updatedAt_desc';

    let shares = await this.shareModel.find({
      sharedWith: new Types.ObjectId(userId)
    } as any).populate('owner', 'name email').populate('project');

    // 휴지통 프로젝트 필터링 및 검색/정렬 로직
    let items = shares.filter(s => s.project && (s.project as any).status !== 'trash');

    if (search) {
      items = items.filter(s => (s.project as any).title.toLowerCase().includes(search.toLowerCase()));
    }

    // 정렬 로직 (메모리 정렬)
    this.sortShares(items, sort);

    return items.map(s => this.toShareDto(s));
  }

  async unshareProject(userId: string, shareId: string) {
    const result = await this.shareModel.deleteOne({
      _id: new Types.ObjectId(shareId),
      owner: new Types.ObjectId(userId)
    } as any);
    if (result.deletedCount === 0) throw new NotFoundException('공유 정보를 찾을 수 없습니다.');
    return { id: shareId };
  }

  private sortShares(items: any[], sort: string) {
    if (sort === 'name_asc') {
      items.sort((a, b) => a.project.title.localeCompare(b.project.title, 'ko'));
    } else if (sort === 'createdAt_desc') {
      items.sort((a, b) => b.project.createdAt.getTime() - a.project.createdAt.getTime());
    } else {
      items.sort((a, b) => b.project.updatedAt.getTime() - a.project.updatedAt.getTime());
    }
  }
}