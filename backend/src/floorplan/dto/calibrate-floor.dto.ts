import {
    IsArray,
    IsIn,
    IsNumber,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PointDto {
    @IsNumber()
    x: number;

    @IsNumber()
    y: number;
}

export class CalibrateFloorplanDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PointDto)
    calibrationPoints: PointDto[];

    @IsNumber()
    scaleRatio: number;

    @IsIn(['mm', 'cm', 'm'])
    scaleUnit: string;
}