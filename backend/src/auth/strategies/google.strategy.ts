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
            clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
            callbackURL: configService.get<string>('GOOGLE_REDIRECT_URI')!,
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
        const { name, emails, photos, id } = profile;

        const userProfile = {
            email: emails[0].value,
            name: `${name.familyName || ''}${name.givenName || ''}`,
            picture: photos[0].value,
            googleId: id,
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