import { ApiPropertyOptional } from "@nestjs/swagger";
import {IsString, IsOptional, IsNumberString, IsNumber, IsIn} from "class-validator";

export class SearchUserMoodDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page?: number

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit?: number

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by?: "DESC"|"ASC"
}
