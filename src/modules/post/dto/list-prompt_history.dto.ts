import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";
export class ListPromptHistoryDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiProperty()
  page: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiProperty()
  limit: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiProperty()
  order_by: "DESC" | "ASC";

  @IsString()
  @ApiProperty()
  @IsOptional()
  createBy?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  prompt_user?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  from_id?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  to_id?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  parent_id?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  chat_type?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  chat_status?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  search?: string;
}
