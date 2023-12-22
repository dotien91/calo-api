import { IsIn, IsString } from "class-validator";

export class UpdateChatRoomUserRoleDto {
  @IsString()
  user_id: string;

  @IsString()
  chat_room_id: string;

  @IsIn(["read", "write"])
  user_permission: string;

  @IsIn(["user", "admin"])
  role: string;
}
