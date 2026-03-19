import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Share extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
    project: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    owner: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    sharedWith: Types.ObjectId;

    @Prop({ type: String, enum: ['viewer', 'editor'], default: 'viewer' })
    permission: string;
}

export const ShareSchema = SchemaFactory.createForClass(Share);

// 복합 유니크 인덱스 설정 (중복 공유 방지)
ShareSchema.index({ project: 1, sharedWith: 1 }, { unique: true });