import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListHandleServiceDto {
    @IsNumberString()
    @IsOptional(null)
    @ApiPropertyOptional()
    page: number;

    @IsNumberString()
    @IsOptional(null)
    @ApiPropertyOptional()
    limit: number

    @IsString()
    @IsOptional(null)
    @ApiPropertyOptional()
    service_type?: string

    @IsIn(['DESC', 'ASC'])
    @IsOptional(null)
    @ApiPropertyOptional()
    order_by: 'DESC'|'ASC'
}
