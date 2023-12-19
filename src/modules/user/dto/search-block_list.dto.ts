import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString, IsIn } from "class-validator";

export class SearchBlockListDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by?: "DESC" | "ASC";
}
