async getSharedByMe(userId: string, query: any) {
  const shares = await this.shareModel
    .find({ owner: new Types.ObjectId(userId) } as any)
    .populate('project')
    .populate('sharedWith', 'email name')
    .sort({ createdAt: -1 });

  return shares.map((share: any) => ({
    id: share._id.toString(),
    projectId: share.project?._id?.toString(),
    projectTitle: share.project?.title ?? '',
    sharedWith: share.sharedWith
      ? {
        id: share.sharedWith._id.toString(),
        email: share.sharedWith.email,
        name: share.sharedWith.name,
      }
      : null,
    createdAt: share.createdAt,
  }));
}