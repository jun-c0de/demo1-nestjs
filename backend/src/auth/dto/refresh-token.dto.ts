import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1Ni...',
        description: '재발급을 위한 리프레시 토큰 문자열',
    })
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}