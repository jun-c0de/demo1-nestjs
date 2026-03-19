import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('인증(Auth)')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  private getRefreshCookieOptions() {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    };
  }

  private getRequestMeta(req: Request) {
    return {
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
    };
  }

  private generatePopupScript(type: string, data: any, clientUrl: string) {
    const safeData = JSON.stringify(data).replace(/</g, '\\u003c');
    return `
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: "${type}", data: ${safeData} }, "${clientUrl}");
            }
            window.close();
          </script>
        </body>
      </html>
    `;
  }

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: SignUpDto })
  async signup(@Body() signUpDto: SignUpDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.authService.signup(signUpDto, this.getRequestMeta(req));
    res.cookie('refreshToken', result.refreshToken, this.getRefreshCookieOptions());
    return res.status(201).json({
      message: '회원가입 성공',
      accessToken: result.accessToken,
      user: result.user,
    });
  }

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.authService.login(loginDto, this.getRequestMeta(req));
    res.cookie('refreshToken', result.refreshToken, this.getRefreshCookieOptions());
    return res.json({
      message: '로그인 성공',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 재발급' })
  @ApiBody({ type: RefreshTokenDto })
  async refresh(@Req() req: Request, @Res() res: Response, @Body() refreshTokenDto: RefreshTokenDto) {
    const refreshTokenValue = refreshTokenDto.refreshToken || req.cookies?.refreshToken;
    if (!refreshTokenValue) {
      throw new UnauthorizedException('리프레시 토큰이 없습니다.');
    }
    const result = await this.authService.refresh(refreshTokenValue, this.getRequestMeta(req));
    res.cookie('refreshToken', result.refreshToken, this.getRefreshCookieOptions());
    return res.json({
      message: '토큰 재발급 성공',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshTokenValue = req.cookies?.refreshToken;
    if (refreshTokenValue) {
      await this.authService.logout(refreshTokenValue);
    }
    res.clearCookie('refreshToken', this.getRefreshCookieOptions());
    return res.json({ message: '로그아웃 성공' });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 정보 조회' })
  async me(@Req() req: any) {
    return req.user;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: '구글 로그인 시작' })
  async googleStart() { }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: '구글 로그인 콜백' })
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const clientUrl = this.configService.get('CLIENT_URL') || 'http://localhost:5173';
    try {
      const result = req.user;
      res.cookie('refreshToken', result.refreshToken, this.getRefreshCookieOptions());
      return res.send(this.generatePopupScript('GOOGLE_AUTH_SUCCESS', result, clientUrl));
    } catch (error: any) {
      return res.send(this.generatePopupScript('GOOGLE_AUTH_ERROR', { message: '인증에 실패했습니다.' }, clientUrl));
    }
  }

  // --- 준비 중인 소셜 로그인 ---

  @Get('kakao')
  @ApiOperation({ summary: '카카오 로그인 준비 중' })
  kakaoComingSoon() {
    return { message: '카카오 로그인은 준비 중입니다.' };
  }

  @Get('naver')
  @ApiOperation({ summary: '네이버 로그인 준비 중' })
  naverComingSoon() {
    return { message: '네이버 로그인은 준비 중입니다.' };
  }
}