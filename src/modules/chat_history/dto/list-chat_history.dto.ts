import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class ListChatHistoryDto {
  @IsNumberString()
  @IsOptional(null)
  page: number;

  @IsString()
  @IsOptional(null)
  from_id: string;

  @IsString()
  @IsOptional(null)
  to_id: string;

  @IsNumberString()
  @IsOptional(null)
  limit: number;

  @IsString()
  @IsOptional(null)
  search: string;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  order_by: "DESC" | "ASC";
}
