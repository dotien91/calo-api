import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListPlanDto {
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
  order_by: 'DESC' | 'ASC'

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  country: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  service_id: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  service_name: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  version: string
}
