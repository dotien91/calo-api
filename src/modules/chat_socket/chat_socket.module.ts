import { Module } from "@nestjs/common";
import { ChatSocketService } from "./chat_socket.service";
import { MongooseModule } from "@nestjs/mongoose";
// import { UserService } from "../user/services/user.service";
// import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
// import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
// import { User, UserSchema } from "../user/schemas/user.schema";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";
// import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
// import { UserOptionService } from "../user/services/user_option.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      // { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      // { name: User.name, schema: UserSchema},
      // { name: UserOption.name, schema: UserOptionSchema}
      // { name: UserSession.name, schema: UserSessionSchema},
      { name: UserSession.name, schema: UserSessionSchema},
    ]),
  ],
  providers: [
    ChatSocketService,

    // UserService,
    // ChatRoomUserOptionService,
    JwtHelperService,
    UserSessionService,
    // UserOptionService
  ],
})
export class ChatSocketModule {}
