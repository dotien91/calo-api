import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListUserGiftDto {
    @IsNumberString()
    @IsOptional(null)
    @ApiPropertyOptional()
    page: number;

    @IsNumberString()
    @IsOptional(null)
    @ApiPropertyOptional()
    limit: number

    @IsIn(['DESC', 'ASC'])
    @IsOptional(null)
    @ApiPropertyOptional()
    order_by: 'DESC'|'ASC'

    @IsString()
    @IsOptional(null)
    @ApiPropertyOptional()
    gift_id: string

    @IsString()
    @IsOptional(null)
    @ApiPropertyOptional()
    gift_status: string

    @IsString()
    @IsOptional(null)
    @ApiPropertyOptional()
    channel_id: string

    @IsString()
    @IsOptional(null)
    @ApiPropertyOptional()
    user_id: string
}
