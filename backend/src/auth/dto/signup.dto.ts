import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // 👈 추가

export class SignUpDto {
    @ApiProperty({ example: 'test@example.com', description: '사용자 이메일' }) // 👈 추가
    @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
    @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
    email: string;

    @ApiProperty({ example: 'password123', description: '비밀번호' }) // 👈 추가
    @IsString()
    @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
    @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
    password: string;

    @ApiProperty({ example: '테스터', description: '사용자 이름' }) // 👈 추가
    @IsString()
    @IsNotEmpty({ message: '이름은 필수 입력 항목입니다.' })
    name: string;
}