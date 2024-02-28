import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsDefined, IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class GetChatRoomListDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit: number;

  @IsIn(["DESC", "ASC"])
  @ApiPropertyOptional()
  @IsOptional(null)
  order_by: "DESC" | "ASC";

  @IsIn(["personal", "group", "all", "anonymous"])
  @ApiPropertyOptional()
  @IsOptional(null)
  room_type: "personal" | "group" | "all" | "anonymous";

  @IsIn(["read", "unread"])
  @ApiPropertyOptional()
  @IsOptional(null)
  read_count: string;

  @IsNumberString()
  @ApiPropertyOptional()
  @IsOptional(null)
  room_private: number;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  is_join: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  search: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ref_user: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_reply: number;

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  from?: string;

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  to?: string;
}

export class FindChatRoomDto {
  @IsDefined()
  @IsString()
  user_id: string;

  @IsDefined()
  @IsString()
  partner_id: string;
}
