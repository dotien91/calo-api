import { ObjectId } from "mongoose";

export class FilterChatRoomDto {
  user_id?: string;
  room_type?: "personal" | "group" | "all" | "anonymous";
  room_private?: number;
  chat_room_id?: string;
  partner_id?: string;
  group_partners?: string[];
  read_count?: string;
  unset?: string;
  from?: string;
  to?: string;
  is_reply?: number;
  ref_user?: string;
  blocked_user?: ObjectId[];
}
