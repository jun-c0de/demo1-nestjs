import {
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsNumber,
} from 'class-validator';

export class CreateFloorplanDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    originalFileUrl: string;

    @IsString()
    @IsIn(['pdf', 'png', 'jpg', 'jpeg'])
    fileType: string;

    @IsOptional()
    @IsNumber()
    pageIndex?: number;

    @IsOptional()
    @IsNumber()
    width?: number;

    @IsOptional()
    @IsNumber()
    height?: number;
}