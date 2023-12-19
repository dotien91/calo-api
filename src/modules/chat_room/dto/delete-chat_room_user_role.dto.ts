import { IsNumberString, IsString } from "class-validator";

export class DeleteChatRoomUserRoleDto {
  @IsString()
  user_id: string;

  @IsString()
  chat_room_id: string;
}
