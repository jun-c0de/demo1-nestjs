import { Type } from 'class-transformer';
import {
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';

class UpdateRoomDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    width?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    height?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    depth?: number;
}

export class UpdateDesignDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateRoomDto)
    room?: UpdateRoomDto;

    @IsOptional()
    @IsObject()
    editorData?: Record<string, any>;
}