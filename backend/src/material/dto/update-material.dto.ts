import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMaterialDto {
    @IsOptional()
    @IsIn(['floor', 'wall', 'ceiling', 'molding'])
    category?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsIn(['m2', 'm', 'ea'])
    unit?: string;

    @IsOptional()
    @IsNumber()
    unitPrice?: number;

    @IsOptional()
    @IsString()
    brand?: string;

    @IsOptional()
    @IsString()
    code?: string;
}