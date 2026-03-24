import { IsNotEmpty, IsString } from 'class-validator';

export class RenameProjectDto {
    @IsString()
    @IsNotEmpty()
    title: string;
}