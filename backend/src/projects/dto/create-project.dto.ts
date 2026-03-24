import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsOptional()
    @IsIn(['residential', 'office', 'commercial'])
    projectType?: string;

    @IsOptional()
    @IsString()
    siteName?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsIn(['mm', 'cm', 'm'])
    defaultUnit?: string;

    @IsOptional()
    @IsString()
    thumbnailUrl?: string;
}