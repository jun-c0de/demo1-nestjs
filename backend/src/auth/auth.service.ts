import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from './schemas/user.schema';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  /**
   * 응답 데이터에서 비밀번호 등 민감한 정보를 제거하는 유틸리티 메서드
   * (중복 제거 완료)
   */
  private toSafeUser(user: any) {
    const userObj = user.toObject ? user.toObject() : user;
    const { password, __v, ...safeUser } = userObj;
    return safeUser;
  }

  /**
   * Access Token과 Refresh Token을 동시에 발급하고, Refresh Token 정보를 DB에 저장합니다.
   */
  private async issueAuthTokens(user: any, meta: { userAgent: string; ipAddress: string }) {
    const userId = user._id.toString();
    const newTokenId = uuidv4();

    // 1. Access Token 생성
    const accessToken = this.jwtService.sign(
      {
        sub: userId,
        email: user.email
      },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES_IN') || '15m',
      },
    );

    // 2. Refresh Token 생성
    const refreshToken = this.jwtService.sign(
      {
        sub: userId,
        email: user.email,
        tokenId: newTokenId
      },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN') || '7d',
      },
    );

    // 3. DB 저장 (만료일 설정)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenModel.create({
      user: userId,
      tokenId: newTokenId,
      expiresAt,
      ...meta,
    });

    console.log('--- 토큰 발급 완료 ---');
    console.log('발급된 tokenId:', newTokenId);
    return { accessToken, refreshToken };
  }

  /**
   * 이메일 회원가입
   */
  async signup(signUpDto: any, meta: any) {
    const { email, password, name } = signUpDto;

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
    });

    const tokens = await this.issueAuthTokens(user, meta);
    return { user: this.toSafeUser(user), ...tokens };
  }

  /**
   * 이메일 로그인
   */
  async login(loginDto: any, meta: any) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }).select('+password');

    if (!user || !user.password) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    const tokens = await this.issueAuthTokens(user, meta);
    return { user: this.toSafeUser(user), ...tokens };
  }

  /**
   * 리프레시 토큰 재발급 로직
   */
  async refresh(oldRefreshToken: string, meta: any) {
    try {
      const payload = await this.jwtService.verifyAsync(oldRefreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      if (!payload.tokenId) {
        throw new UnauthorizedException('유효하지 않은 토큰 구조입니다.');
      }

      const storedToken = await this.refreshTokenModel.findOne({
        tokenId: payload.tokenId,
        revokedAt: null,
      }).exec();

      if (!storedToken) {
        throw new UnauthorizedException('이미 사용되었거나 존재하지 않는 토큰입니다.');
      }

      // Rotation: 기존 토큰 무효화
      storedToken.revokedAt = new Date();
      await storedToken.save();

      const user = await this.userModel.findById(payload.sub).exec();
      if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다.');

      return this.issueAuthTokens(user, meta);

    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('리프레시 토큰이 만료되었습니다.');
      }
      throw new UnauthorizedException('토큰 검증에 실패했습니다.');
    }
  }

  /**
   * 로그아웃
   */
  async logout(refreshToken: string) {
    try {
      const payload = this.jwtService.decode(refreshToken) as any;
      if (payload && payload.tokenId) {
        await this.refreshTokenModel.updateOne(
          { tokenId: payload.tokenId },
          { revokedAt: new Date() },
        );
      }
    } catch (e) {
      // 에러 무시
    }
  }

  /**
   * 현재 유저 정보 조회 (JwtStrategy에서 호출)
   */
  async me(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    return user ? this.toSafeUser(user) : null;
  }

  /**
   * 구글 로그인 URL 생성
   */
  getGoogleAuthUrl() {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: this.configService.get<string>('GOOGLE_REDIRECT_URI')!,
      client_id: this.configService.get<string>('GOOGLE_CLIENT_ID')!,
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

  /**
   * 구글 로그인 처리
   */
  async googleLogin(code: string, meta: any) {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: this.configService.get('GOOGLE_CLIENT_ID'),
      client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
      redirect_uri: this.configService.get('GOOGLE_REDIRECT_URI'),
      grant_type: 'authorization_code',
    });

    const { data: profile } = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${data.access_token}`,
      { headers: { Authorization: `Bearer ${data.id_token}` } },
    );

    let user = await this.userModel.findOne({ email: profile.email });

    if (!user) {
      const randomPassword = uuidv4();
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await this.userModel.create({
        email: profile.email,
        name: profile.name,
        googleId: profile.id,
        avatar: profile.picture,
        password: hashedPassword,
      });
    }

    const tokens = await this.issueAuthTokens(user, meta);
    return { user: this.toSafeUser(user), ...tokens };
  }

  /**
   * GoogleStrategy에서 호출하는 유저 검증 및 생성 로직
   */
  async validateOAuthUser(profile: { email: string; name: string; picture: string; googleId?: string }, meta: any) {
    // 1. DB에서 해당 이메일로 유저가 있는지 확인
    let user = await this.userModel.findOne({ email: profile.email });

    // 2. 유저가 없다면 새로 생성 (회원가입)
    if (!user) {
      // 소셜 로그인은 비밀번호가 없으므로 무작위 값으로 해싱하여 저장
      const randomPassword = uuidv4();
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await this.userModel.create({
        email: profile.email,
        name: profile.name,
        avatar: profile.picture,
        password: hashedPassword,
        // 구글 로그인임을 표시하거나 추가 정보를 저장하고 싶다면 아래 주석 해제
        // googleId: profile.googleId, 
      });
    }

    // 3. 서비스용 토큰(Access/Refresh) 발급
    const tokens = await this.issueAuthTokens(user, meta);

    return {
      user: this.toSafeUser(user),
      ...tokens,
    };
  }
}

