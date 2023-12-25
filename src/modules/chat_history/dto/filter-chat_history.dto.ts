import { ObjectId } from "mongoose";

export class FilterChatHistoryDto {
  ids?: string;
  user_id?: string;
  chat_room_id?: string;
  from_id?: string;
  to_id?: string;
  search?: string;
  blocked_user?: ObjectId[];
}
