import { IsOptional, IsString } from 'class-validator';

export class UpdateRoomMaterialsDto {
    @IsOptional()
    @IsString()
    floorMaterialId?: string | null;

    @IsOptional()
    @IsString()
    wallMaterialId?: string | null;

    @IsOptional()
    @IsString()
    ceilingMaterialId?: string | null;
}