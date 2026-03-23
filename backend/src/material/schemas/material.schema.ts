import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Material extends Document {
    @Prop({
        type: String,
        enum: ['floor', 'wall', 'ceiling', 'molding'],
        required: true,
    })
    category: string;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({
        type: String,
        enum: ['m2', 'm', 'ea'],
        required: true,
    })
    unit: string;

    @Prop({ required: true })
    unitPrice: number;

    @Prop({ default: '' })
    brand: string;

    @Prop({ required: true })
    code: string;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);