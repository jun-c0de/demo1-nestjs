import {
    IsArray,
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PointDto {
    @IsNumber()
    x: number;

    @IsNumber()
    y: number;
}

export class CreateRoomDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsIn(['living', 'bedroom', 'kitchen', 'bathroom', 'etc'])
    type?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PointDto)
    polygon?: PointDto[];

    @IsOptional()
    @IsNumber()
    area?: number;

    @IsOptional()
    @IsNumber()
    perimeter?: number;

    @IsOptional()
    @IsNumber()
    ceilingHeight?: number;
}