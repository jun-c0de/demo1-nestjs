import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RefreshToken extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    user: Types.ObjectId;

    @Prop({ required: true, unique: true, index: true })
    tokenId: string;

    @Prop({ required: true, index: true })
    expiresAt: Date;

    @Prop({ type: Date, default: null })
    revokedAt?: Date;

    @Prop({ default: '' })
    userAgent?: string;

    @Prop({ default: '' })
    ipAddress?: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);