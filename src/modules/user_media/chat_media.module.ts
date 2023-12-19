import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserService } from "../user/services/user.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { ChatMediaController } from "./controllers/chat_media.controller";
import { ChatMedia, ChatMediaSchema } from "./schemas/chat_media.schema";
import { ChatMediaService } from "./services/chat_media.service";
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
    ]),
  ],
  controllers: [ChatMediaController],
  providers: [ChatMediaService, UserService, UserPermissionService],
  exports: [ChatMediaService],
})
export class ChatMediaModule {}
