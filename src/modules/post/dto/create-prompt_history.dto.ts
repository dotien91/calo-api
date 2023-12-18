import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject, IsJSON } from "class-validator";
export class CreatePromptHistoryDto {
  @IsString()
  @ApiProperty()
  prompt_user: string;

  @IsString()
  @ApiProperty()
  createBy: string

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  chat_content?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  chat_content_to_ai?: string

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  parent_id?: string;

  @IsJSON()
  @IsOptional(null)
  @ApiProperty()
  media_data?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  chat_status?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  message_type?: string;

  @IsString()
  @ApiProperty()
  @IsOptional(null)
  send_at?: string;
}
