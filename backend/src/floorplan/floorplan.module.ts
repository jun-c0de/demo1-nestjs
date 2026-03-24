import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FloorplanController } from './floorplan.controller';
import { FloorplanService } from './floorplan.service';
import { Floorplan, FloorplanSchema } from './schemas/floorplan.schema';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Floorplan.name, schema: FloorplanSchema },
            { name: Project.name, schema: ProjectSchema },
        ]),
    ],
    controllers: [FloorplanController],
    providers: [FloorplanService],
    exports: [FloorplanService],
})
export class FloorplanModule { }