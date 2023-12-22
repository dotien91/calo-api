import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdateChatRoomUserDto {
  @IsString()
  _id: string;

  @IsString()
  @IsOptional(null)
  room_name: string;

  @IsString()
  @IsOptional(null)
  room_description: string;

  @IsString()
  @IsOptional(null)
  room_image: string;

  @IsString()
  @IsOptional(null)
  room_thumb: string;

  @IsIn(["0", "1"])
  @IsOptional(null)
  mute_status: number;
}
