import { IsIn, IsJSON, IsOptional, IsString } from "class-validator";

export class CreateChatRoomAdminDto {
  @IsString()
  partner_id: string;

  @IsIn(["personal", "group", "anonymous"])
  @IsOptional(null)
  chat_type: "personal" | "group" | "anonymous";

  @IsString()
  @IsOptional(null)
  room_name: string;

  @IsString()
  @IsOptional(null)
  chat_content?: string;

  @IsString()
  @IsOptional(null)
  parent_id?: string;

  @IsJSON()
  @IsOptional(null)
  media_data?: string;
}
