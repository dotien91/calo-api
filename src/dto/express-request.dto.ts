import { Request } from "express";
import { User } from "../modules/user/schemas/user.schema";
import { UserSession } from "../modules/user/schemas/user_session.schema";

interface UserLogin {
  user_id?: string
  user_object?: User
  auth_code?: string
  session_id?: string
  session_data?: UserSession
  channel_id?: string
  rawBody?: any
}
export interface ExpressRequestDto extends Request, UserLogin { }
