import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Design extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
    project: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    owner: Types.ObjectId;

    @Prop({ required: true, maxLength: 50 })
    name: string;

    @Prop({
        type: {
            width: { type: Number, default: 3600 },
            height: { type: Number, default: 2360 },
            depth: { type: Number, default: 600 },
        },
        _id: false,
    })
    room: {
        width: number;
        height: number;
        depth: number;
    };

    @Prop({ type: Object, default: {} })
    editorData: any;
}

export const DesignSchema = SchemaFactory.createForClass(Design);