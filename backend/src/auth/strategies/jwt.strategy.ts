import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            // 헤더의 Bearer 토큰 추출
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // .env의 JWT_ACCESS_SECRET이 절대 비어있지 않음을 !로 보장합니다.
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
        });
    }

    async validate(payload: any) {
        // payload.sub (유저 ID)로 DB에서 유저 정보를 조회합니다.
        const user = await this.authService.me(payload.sub);

        if (!user) {
            console.warn(`[JwtStrategy] 인증 실패: ID(${payload.sub}) 유저 없음`);
            throw new UnauthorizedException('인증되지 않은 사용자입니다.');
        }

        // 반환된 user는 req.user에 담깁니다.
        return user;
    }
}