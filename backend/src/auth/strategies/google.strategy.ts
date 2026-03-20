import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        super({
            clientID: configService.get('GOOGLE_CLIENT_ID')!,
            clientSecret: configService.get('GOOGLE_CLIENT_SECRET')!,
            callbackURL: configService.get('GOOGLE_REDIRECT_URI')!,
            scope: ['email', 'profile'],
        });
    }

    authorizationParams(): Record<string, string> {
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
    ): Promise<void> {
        const email = profile?.emails?.[0]?.value;
        const picture = profile?.photos?.[0]?.value;
        const familyName = profile?.name?.familyName || '';
        const givenName = profile?.name?.givenName || '';
        const googleId = profile?.id;

        const userProfile = {
            email,
            name: `${familyName}${givenName}`.trim() || profile?.displayName || 'Google User',
            picture: picture || '',
            googleId,
        };

        const meta = {
            userAgent: 'google-oauth',
            ipAddress: '0.0.0.0',
        };

        try {
            const result = await this.authService.validateOAuthUser(userProfile, meta);
            done(null, result);
        } catch (err) {
            done(err, false);
        }
    }
}