import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { CurrentUser } from '../interfaces/current-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
        });
    }

    async validate(payload: any): Promise<CurrentUser> {
        const user = await this.authService.me(payload.sub);

        if (!user) {
            throw new UnauthorizedException('인증되지 않은 사용자입니다.');
        }

        return {
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            provider: user.provider,
        };
    }
}