import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

class Point {
    @Prop({ required: true })
    x: number;

    @Prop({ required: true })
    y: number;
}

@Schema({ timestamps: true })
export class Floorplan extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
    projectId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    owner: Types.ObjectId;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true })
    originalFileUrl: string;

    @Prop({
        type: String,
        enum: ['pdf', 'png', 'jpg', 'jpeg'],
        required: true,
    })
    fileType: string;

    @Prop({ type: Number, default: null })
    pageIndex: number | null;

    @Prop({ type: Number, default: null })
    scaleRatio: number | null;

    @Prop({
        type: String,
        enum: ['mm', 'cm', 'm'],
        default: 'mm',
    })
    scaleUnit: string;

    @Prop({ type: [Point], default: [] })
    calibrationPoints: Point[];

    @Prop({ type: Number, default: 0 })
    width: number;

    @Prop({ type: Number, default: 0 })
    height: number;

    @Prop({
        type: String,
        enum: ['uploaded', 'calibrated', 'reviewed'],
        default: 'uploaded',
    })
    status: string;
}

export const FloorplanSchema = SchemaFactory.createForClass(Floorplan);