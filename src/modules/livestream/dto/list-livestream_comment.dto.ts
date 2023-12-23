import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListLivestreamCommentDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  from_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  to_id: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit: number

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  search: string

  @IsIn(['DESC', 'ASC'])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by: 'DESC' | 'ASC'
}
