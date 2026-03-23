import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateProjectMetaDto {
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