import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop()
    password?: string;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ default: 'local' })
    provider: string;

    @Prop()
    picture?: string;

    @Prop()
    googleId?: string;

    @Prop({ default: 'user' })
    role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);