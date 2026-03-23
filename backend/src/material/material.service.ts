import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Material } from './schemas/material.schema';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialService {
    constructor(
        @InjectModel(Material.name)
        private readonly materialModel: Model<Material>,
    ) { }

    private toDto(doc: any) {
        return {
            id: doc._id.toString(),
            category: doc.category,
            name: doc.name,
            unit: doc.unit,
            unitPrice: doc.unitPrice,
            brand: doc.brand,
            code: doc.code,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }

    async create(dto: CreateMaterialDto) {
        const doc = await this.materialModel.create(dto);
        return this.toDto(doc);
    }

    async findAll() {
        return (await this.materialModel.find()).map((d) => this.toDto(d));
    }

    async update(id: string, dto: UpdateMaterialDto) {
        const doc = await this.materialModel.findByIdAndUpdate(
            new Types.ObjectId(id),
            dto,
            { new: true },
        );

        if (!doc) throw new NotFoundException('자재를 찾을 수 없습니다.');

        return this.toDto(doc);
    }

    async remove(id: string) {
        await this.materialModel.deleteOne({ _id: new Types.ObjectId(id) });
        return { id };
    }

    async findById(id: string) {
        return this.materialModel.findById(id);
    }
}