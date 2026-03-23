import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

class EstimateItem {
    @Prop() roomId: string;
    @Prop() materialId: string;
    @Prop() category: string;
    @Prop() quantity: number;
    @Prop() unitPrice: number;
    @Prop() total: number;
}

@Schema({ timestamps: true })
export class Estimate extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
    projectId: Types.ObjectId;

    @Prop({ type: [EstimateItem], default: [] })
    items: EstimateItem[];

    @Prop({ default: 0 })
    totalCost: number;
}

export const EstimateSchema = SchemaFactory.createForClass(Estimate);