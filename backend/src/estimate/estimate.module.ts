import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Estimate, EstimateSchema } from './schemas/estimate.schema';
import { EstimateService } from './estimate.service';
import { EstimateController } from './estimate.controller';
import { Room, RoomSchema } from '../room/schemas/room.schema';
import { Material, MaterialSchema } from '../material/schemas/material.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Estimate.name, schema: EstimateSchema },
            { name: Room.name, schema: RoomSchema },
            { name: Material.name, schema: MaterialSchema },
        ]),
    ],
    controllers: [EstimateController],
    providers: [EstimateService],
})
export class EstimateModule { }