import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Share extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
    project: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    owner: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    sharedWith: Types.ObjectId;
}

export const ShareSchema = SchemaFactory.createForClass(Share);