import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Estimate } from './schemas/estimate.schema';
import { Room } from '../room/schemas/room.schema';
import { Material } from '../material/schemas/material.schema';

@Injectable()
export class EstimateService {
    constructor(
        @InjectModel(Estimate.name)
        private readonly estimateModel: Model<Estimate>,
        @InjectModel(Room.name)
        private readonly roomModel: Model<Room>,
        @InjectModel(Material.name)
        private readonly materialModel: Model<Material>,
    ) { }

    async generate(projectId: string) {
        const rooms = await this.roomModel.find({
            projectId: new Types.ObjectId(projectId),
        });

        const items: any[] = [];

        for (const room of rooms) {
            const materials = [
                { id: room.floorMaterialId, category: 'floor' },
                { id: room.wallMaterialId, category: 'wall' },
                { id: room.ceilingMaterialId, category: 'ceiling' },
            ];

            for (const m of materials) {
                if (!m.id) continue;

                const material = await this.materialModel.findById(m.id);
                if (!material) continue;

                let quantity = 0;

                if (m.category === 'floor') quantity = room.area;
                if (m.category === 'wall') quantity = room.perimeter;
                if (m.category === 'ceiling') quantity = room.area;

                const total = quantity * material.unitPrice;

                items.push({
                    roomId: room._id.toString(),
                    materialId: material._id.toString(),
                    category: m.category,
                    quantity,
                    unitPrice: material.unitPrice,
                    total,
                });
            }
        }

        const totalCost = items.reduce((sum, i) => sum + i.total, 0);

        const estimate = await this.estimateModel.create({
            projectId: new Types.ObjectId(projectId),
            items,
            totalCost,
        });

        return estimate;
    }
}