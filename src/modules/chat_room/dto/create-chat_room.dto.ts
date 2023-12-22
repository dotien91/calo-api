import { IsIn, IsOptional, IsString } from "class-validator";

export class CreateChatRoomDto {
  @IsString()
  partner_id: string;

  @IsIn(["personal", "group", "anonymous"])
  chat_type: "personal" | "group" | "anonymous";

  @IsString()
  @IsOptional(null)
  room_name: string;
}
