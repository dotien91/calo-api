import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNumberString, IsOptional } from "class-validator";

export class ListPodcastCategoryDto {
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
  order_by: "DESC" | "ASC";

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  version: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_status: string;
}
