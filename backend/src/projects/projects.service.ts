import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(userId: string, data: { name: string; description?: string }) {
    return this.prisma.project.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    return project;
  }
}