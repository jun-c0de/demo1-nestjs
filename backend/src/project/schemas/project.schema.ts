import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Project extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    owner: Types.ObjectId;

    @Prop({ required: true, maxLength: 100 })
    title: string;

    @Prop({
        type: String,
        enum: ['active', 'completed', 'trash'],
        default: 'active'
    })
    status: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);