import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumberString } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";
import { CreateRequestCategoryDto } from "./create-request_category.dto";

export class UpdateRequestCategoryDto extends PartialType(CreateRequestCategoryDto) {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_status?: string;
}
