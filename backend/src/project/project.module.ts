import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Project, ProjectSchema } from './schemas/project.schema';
import { Design, DesignSchema } from '../design/schemas/design.schema';
import { Floorplan, FloorplanSchema } from '../floorplan/schemas/floorplan.schema';
import { Share, ShareSchema } from '../share/schemas/share.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Design.name, schema: DesignSchema },
      { name: Floorplan.name, schema: FloorplanSchema },
      { name: Share.name, schema: ShareSchema },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule { }