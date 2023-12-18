import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ShortService } from "./services/short.service";
import { Short, ShortSchema } from "./schemas/short.schema";
import { ShortHelper } from "./helper/short.helper";
import { ShortController } from "./controllers/short.controller";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { ShortLike, ShortLikeSchema } from "./schemas/short_like.schema";
import { ShortView, ShortViewSchema } from "./schemas/short_view.schema";
import { ShortViewService } from "./services/short_view.service";
import { ShortLikeService } from "./services/short_like.service";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserOptionService } from "../user/services/user_option.service";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Short.name, schema: ShortSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: ShortLike.name, schema: ShortLikeSchema },
      { name: ShortView.name, schema: ShortViewSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: UserSession.name, schema: UserSessionSchema },
    ]),
  ],
  controllers: [ShortController],
  providers: [
    ShortService,
    ShortHelper,
    ShortViewService,
    UserOptionService,
    ShortLikeService,
    UserSessionService,
    UserPermissionService,
    ChatMediaService,
  ],
  exports: [ShortHelper],
})
export class ShortModule {}
