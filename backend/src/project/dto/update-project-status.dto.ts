import { IsIn } from 'class-validator';

export class UpdateProjectStatusDto {
    @IsIn(['active', 'completed', 'trash'])
    status: string;
}