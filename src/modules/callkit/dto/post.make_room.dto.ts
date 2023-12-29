import { ApiProperty } from "@nestjs/swagger";
import { IsJSON, IsNumberString, IsOptional, IsString } from "class-validator";

export class PostMakeRoomDto {
  @IsString()
  @ApiProperty()
  chat_room_id: string;

  @IsString()
  @ApiProperty()
  partner_id: string;

  @IsString()
  @ApiProperty()
  call_type: string;

  @IsString()
  @ApiProperty()
  call_time: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiProperty()
  notification?: number;

  @IsJSON()
  @IsOptional(null)
  @ApiProperty()
  offer_candidates?: string;

  @IsJSON()
  @IsOptional(null)
  @ApiProperty()
  answer_candidates?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  offer?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  answer?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  version?: string;
}
