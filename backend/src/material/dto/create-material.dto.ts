import { IsIn, IsNumber, IsString } from 'class-validator';

export class CreateMaterialDto {
    @IsIn(['floor', 'wall', 'ceiling', 'molding'])
    category: string;

    @IsString()
    name: string;

    @IsIn(['m2', 'm', 'ea'])
    unit: string;

    @IsNumber()
    unitPrice: number;

    @IsString()
    brand: string;

    @IsString()
    code: string;
}