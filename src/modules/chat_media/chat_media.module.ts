import { Module } from "@nestjs/common";
import { ChatMediaService } from "./services/chat_media.service";
import { ChatMediaController } from "./controllers/chat_media.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { UserService } from "../user/services/user.service";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { ChatMediaSchema, ChatMedia } from "./schemas/chat_media.schema";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { GiftModule } from "../gift/gift.module";
@Module({
  imports: [
    GiftModule,
    MongooseModule.forFeature([
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      { name: User.name, schema: UserSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
    ]),
  ],
  controllers: [ChatMediaController],
  providers: [ChatMediaService, UserService, ChatRoomUserOptionService, UserPermissionService],
  exports: [ChatMediaService],
})
export class ChatMediaModule {}
