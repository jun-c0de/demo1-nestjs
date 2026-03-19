import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Project, ProjectSchema } from './schemas/project.schema';
import { Design, DesignSchema } from '../design/schemas/design.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Design.name, schema: DesignSchema },
      // Share는 아직 Schema를 안 만들었으므로 문자열로 임시 등록하거나 
      // ShareSchema 완성 후 교체하세요.
      { name: 'Share', schema: {} as any },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule { }