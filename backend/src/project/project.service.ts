async getProjectCounts(userId: string) {
  const owner = new Types.ObjectId(userId);

  const [active, completed, trash] = await Promise.all([
    this.projectModel.countDocuments({ owner, status: 'active' } as any),
    this.projectModel.countDocuments({ owner, status: 'completed' } as any),
    this.projectModel.countDocuments({ owner, status: 'trash' } as any),
  ]);

  return { active, completed, trash };
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