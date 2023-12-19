import { IsString, IsNotEmpty, IsOptional, IsJSON, IsNumberString, IsIn } from "class-validator";
import { UsePipes, ValidationPipe } from "@nestjs/common";

@UsePipes(
  new ValidationPipe({
    disableErrorMessages: true,
    forbidNonWhitelisted: false,
    whitelist: false,
  })
)
export class CreateChatMediaPresignDto {
  @IsIn(["image", "video", "audio", "file", "link", "account", "gif"])
  media_type: string;

  @IsString()
  media_mime_type: string;

  @IsString()
  media_url: string;

  @IsString()
  @IsOptional(null)
  media_content?: string;

  @IsString()
  media_file_name: string;

  @IsString()
  @IsOptional(null)
  chat_room_id: string;

  @IsString()
  @IsOptional(null)
  chat_history_id: string;

  @IsJSON()
  @IsOptional(null)
  media_meta: string;

  @IsString()
  media_thumbnail: string;

  @IsString()
  @IsOptional(null)
  media_square: string;

  @IsString()
  @IsOptional(null)
  gender: string;

  @IsNumberString()
  @IsOptional(null)
  sexual_content: string;

  @IsString()
  @IsOptional(null)
  data_ai: string;

  @IsString()
  @IsOptional(null)
  function_type: string;
}
