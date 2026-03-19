import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: 'http://localhost:3000/api/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }

    // 핵심: prompt 옵션을 여기에 정의해야 타입 에러가 나지 않고 구글 계정 선택창이 뜹니다.
    authorizationParams(): { [key: string]: string } {
        return {
            prompt: 'select_account',
            access_type: 'offline',
        };
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { name, emails, photos, id } = profile;
        const userProfile = {
            email: emails[0].value,
            name: `${name.familyName || ''}${name.givenName || ''}`,
            picture: photos[0].value,
            googleId: id,
        };

        const meta = { userAgent: 'google-oauth', ipAddress: '0.0.0.0' };

        try {
            const result = await this.authService.validateOAuthUser(userProfile, meta);
            done(null, result);
        } catch (err) {
            done(err, false);
        }
    }
}