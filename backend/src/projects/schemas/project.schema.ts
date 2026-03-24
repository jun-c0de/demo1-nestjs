import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Project extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    owner: Types.ObjectId;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop({
        type: String,
        enum: ['active', 'completed', 'trash'],
        default: 'active',
    })
    status: string;

    @Prop({
        type: String,
        enum: ['residential', 'office', 'commercial'],
        default: 'residential',
    })
    projectType: string;

    @Prop({ type: String, trim: true, default: '' })
    siteName: string;

    @Prop({ type: String, trim: true, default: '' })
    address: string;

    @Prop({
        type: String,
        enum: ['mm', 'cm', 'm'],
        default: 'mm',
    })
    defaultUnit: string;

    @Prop({ type: String, default: '' })
    thumbnailUrl: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);