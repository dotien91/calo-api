import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ChatMedia, ChatMediaSchema } from "../media/schemas/chat_media.schema";
import { ChatMediaService } from "../media/services/chat_media.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserService } from "../user/services/user.service";
import { UserSessionService } from "../user/services/user_session.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { ShortController } from "./controllers/short.controller";
import { ShortHelper } from "./helper/short.helper";
import { Short, ShortSchema } from "./schemas/short.schema";
import { ShortLike, ShortLikeSchema } from "./schemas/short_like.schema";
import { ShortView, ShortViewSchema } from "./schemas/short_view.schema";
import { ShortService } from "./services/short.service";
import { ShortLikeService } from "./services/short_like.service";
import { ShortViewService } from "./services/short_view.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema},
      { name: Short.name, schema: ShortSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: ShortLike.name, schema: ShortLikeSchema },
      { name: ShortView.name, schema: ShortViewSchema },
      { name: UserSession.name, schema: UserSessionSchema },
    ]),
  ],
  controllers: [ShortController],
  providers: [
    UserService,
    ShortService,
    ShortHelper,
    ShortViewService,
    ShortLikeService,
    UserSessionService,
    UserPermissionService,
    ChatMediaService,
  ],
  exports: [ShortHelper],
})
export class ShortModule {}
