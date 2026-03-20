import { IsString, MinLength } from 'class-validator';

export class CreateDesignDto {
    @IsString()
    @MinLength(1)
    name: string;
}