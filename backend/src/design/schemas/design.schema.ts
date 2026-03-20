import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Design extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
    project: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    owner: Types.ObjectId;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ type: Object, default: {} })
    room: any;

    @Prop({ type: Object, default: {} })
    editorData: any;
}

export const DesignSchema = SchemaFactory.createForClass(Design);