import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: [true, '이름은 필수입니다.'], trim: true })
    name: string;

    @Prop({
        required: [true, '이메일은 필수입니다.'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, '올바른 이메일 형식이 아닙니다.'],
    })
    email: string;

    @Prop({
        type: String,
        minlength: [8, '비밀번호는 8자 이상이어야 합니다.'],
        select: false, // 로그인 시 .select('+password')를 써야 가져올 수 있음
        required: function (this: any) {
            return !this.googleId && !this.kakaoId && !this.naverId;
        },
    })
    password?: string;

    @Prop({ unique: true, sparse: true })
    googleId?: string;

    @Prop({ unique: true, sparse: true })
    kakaoId?: string;

    @Prop({ unique: true, sparse: true })
    naverId?: string;

    @Prop({ default: '' })
    avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// --- 미들웨어(pre save)를 삭제했습니다 ---
// AuthService에서 이미 해싱을 하므로 여기서 또 하면 이중 암호화가 됩니다.

// --- 인스턴스 메서드(comparePassword)도 삭제 권장 ---
// AuthService에서 bcrypt.compare를 직접 사용하는 것이 NestJS 구조에 더 적합합니다.