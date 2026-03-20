import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { StringValue } from 'ms';

import { User } from './schemas/user.schema';
import { RefreshToken } from './schemas/refresh-token.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  private toSafeUser(user: any) {
    const userObj = user?.toObject ? user.toObject() : user;
    const { password, __v, ...safeUser } = userObj;
    return safeUser;
  }

  private getRefreshTokenExpiresAt() {
    const raw =
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '7d';

    const match = raw.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = Number(match[1]);
    const unit = match[2];

    const unitMs: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * unitMs[unit]);
  }

  private async issueAuthTokens(
    user: any,
    meta: { userAgent?: string; ipAddress?: string },
  ) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user._id.toString(),
        email: user.email,
        type: 'access',
      },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn:
          (this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN') ||
            '10m') as StringValue,
      },
    );

    const tokenId = uuidv4();

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user._id.toString(),
        type: 'refresh',
        jti: tokenId,
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn:
          (this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') ||
            '7d') as StringValue,
      },
    );

    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const expiresAt = this.getRefreshTokenExpiresAt();

    await this.refreshTokenModel.create({
      user: user._id,
      tokenId,
      tokenHash,
      expiresAt,
      revoked: false,
      revokedAt: null,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    return {
      accessToken,
      refreshToken,
      user: this.toSafeUser(user),
    };
  }

  async signup(signUpDto: any, meta: any) {
    const email = signUpDto.email?.trim().toLowerCase();
    const password = signUpDto.password;
    const name = signUpDto.name?.trim();

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userModel.create({
      email,
      password: hashedPassword,
      name,
      provider: 'local',
    });

    const tokens = await this.issueAuthTokens(user, meta);
    return tokens;
  }

  async login(loginDto: any, meta: any) {
    const email = loginDto.email?.trim().toLowerCase();
    const password = loginDto.password;

    const user = await this.userModel.findOne({ email }).select('+password');

    if (!user || !user.password) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    const tokens = await this.issueAuthTokens(user, meta);
    return tokens;
  }

  async refresh(oldRefreshToken: string, meta: any) {
    try {
      const payload = await this.jwtService.verifyAsync(oldRefreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (!payload.jti) {
        throw new UnauthorizedException('유효하지 않은 토큰 구조입니다.');
      }

      const tokenHash = crypto
        .createHash('sha256')
        .update(oldRefreshToken)
        .digest('hex');

      const storedToken = await this.refreshTokenModel
        .findOne({
          tokenId: payload.jti,
          tokenHash,
          revokedAt: null,
          revoked: false,
        })
        .exec();

      if (!storedToken) {
        throw new UnauthorizedException(
          '이미 사용되었거나 존재하지 않는 토큰입니다.',
        );
      }

      storedToken.revokedAt = new Date();
      storedToken.revoked = true;
      await storedToken.save();

      const user = await this.userModel.findById(payload.sub).exec();
      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }

      return this.issueAuthTokens(user, meta);
    } catch (e: any) {
      if (e?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('리프레시 토큰이 만료되었습니다.');
      }
      throw new UnauthorizedException('토큰 검증에 실패했습니다.');
    }
  }

  async logout(refreshToken: string) {
    try {
      const payload = this.jwtService.decode(refreshToken) as any;

      if (payload?.jti) {
        await this.refreshTokenModel.updateOne(
          { tokenId: payload.jti },
          {
            revokedAt: new Date(),
            revoked: true,
          },
        );
      }
    } catch {
      // 로그아웃은 조용히 처리
    }
  }

  async me(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    return user ? this.toSafeUser(user) : null;
  }

  getGoogleAuthUrl() {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

    const options = {
      redirect_uri: this.configService.get<string>('GOOGLE_REDIRECT_URI') || '',
      client_id: this.configService.get<string>('GOOGLE_CLIENT_ID') || '',
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };

    return `${rootUrl}?${new URLSearchParams(options).toString()}`;
  }

  async googleLogin(code: string, meta: any) {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      client_secret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      redirect_uri: this.configService.get<string>('GOOGLE_REDIRECT_URI'),
      grant_type: 'authorization_code',
    });

    const { data: profile } = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${data.access_token}`,
    );

    let user = await this.userModel.findOne({ email: profile.email });

    if (!user) {
      const randomPassword = uuidv4();
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await this.userModel.create({
        email: profile.email,
        name: profile.name || 'Google User',
        googleId: profile.id,
        avatar: profile.picture,
        password: hashedPassword,
        provider: 'google',
      });
    } else {
      user.name = user.name || profile.name || 'Google User';
      user.googleId = profile.id || user.googleId;
      user.avatar = profile.picture || user.avatar;
      user.provider = 'google';
      await user.save();
    }

    const tokens = await this.issueAuthTokens(user, meta);
    return tokens;
  }

  async validateOAuthUser(
    profile: {
      email: string;
      name: string;
      picture: string;
      googleId?: string;
    },
    meta: any,
  ) {
    const email = profile.email?.trim().toLowerCase();
    if (!email) {
      throw new UnauthorizedException('구글 계정 이메일 정보를 찾을 수 없습니다.');
    }

    let user = await this.userModel.findOne({ email });

    if (!user) {
      const randomPassword = uuidv4();
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await this.userModel.create({
        email,
        name: profile.name || 'Google User',
        avatar: profile.picture || '',
        password: hashedPassword,
        googleId: profile.googleId,
        provider: 'google',
      });
    } else {
      user.name = user.name || profile.name || 'Google User';
      user.avatar = profile.picture || user.avatar;
      user.googleId = profile.googleId || user.googleId;
      user.provider = 'google';
      await user.save();
    }

    const tokens = await this.issueAuthTokens(user, meta);

    return { tokens };
  }
}