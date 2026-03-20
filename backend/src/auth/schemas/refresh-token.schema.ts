import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RefreshToken extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ required: true })
    tokenHash: string;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ default: false })
    revoked: boolean;

    @Prop()
    userAgent?: string;

    @Prop()
    ipAddress?: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);