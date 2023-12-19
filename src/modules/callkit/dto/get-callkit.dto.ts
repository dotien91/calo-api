import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class GetCallkitDto {
  @IsNumberString()
  @ApiProperty()
  @IsOptional(null)
  page: number;

  @IsNumberString()
  @ApiProperty()
  @IsOptional(null)
  limit: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiProperty()
  order_by: "DESC" | "ASC";

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  room_name?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  user_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  partner_id?: string;
}
