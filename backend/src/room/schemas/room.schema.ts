import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

class Point {
    @Prop({ required: true })
    x: number;

    @Prop({ required: true })
    y: number;
}

@Schema({ timestamps: true })
export class Room extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
    projectId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Floorplan', required: true })
    floorplanId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    owner: Types.ObjectId;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({
        type: String,
        enum: ['living', 'bedroom', 'kitchen', 'bathroom', 'etc'],
        default: 'etc',
    })
    type: string;

    @Prop({ type: [Point], default: [] })
    polygon: Point[];

    @Prop({ type: Number, default: 0 })
    area: number;

    @Prop({ type: Number, default: 0 })
    perimeter: number;

    @Prop({ type: Number, default: 2400 })
    ceilingHeight: number;

    @Prop({ type: String, default: null })
    floorMaterialId: string | null;

    @Prop({ type: String, default: null })
    wallMaterialId: string | null;

    @Prop({ type: String, default: null })
    ceilingMaterialId: string | null;
}

export const RoomSchema = SchemaFactory.createForClass(Room);