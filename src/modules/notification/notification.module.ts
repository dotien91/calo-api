import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NotificationService } from "./services/notification.service";
import { Notification, NotificationSchema } from "./schemas/notification.schema";
import { NotificationHelper } from "./helper/notification.helper";
import { NotificationController } from "./controllers/notification.controller";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { UserSessionService } from "../user/services/user_session.service";
import { ChatHistory, ChatHistorySchema } from "../chat_history/schemas/chat_history.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { UserService } from "../user/services/user.service";
import { ChannelService } from "../channel/services/channel.service";
import { GiftService } from "../gift/services/gift.service";
import { Channel } from "diagnostics_channel";
import { ChannelSchema } from "../channel/schemas/channel.schema";
import { Gift, GiftSchema } from "../gift/schemas/gift.schema";
import { ChannelPermission } from "../channel/schemas/channel_permission.schema";
import { ChannelPermissionSchema } from "../channel/schemas/channel_permission.";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: User.name, schema: UserSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationHelper,
    UserPermissionService,
    UserSessionService,
    JwtHelperService,
    UserService,
    ChannelService,
    GiftService,
    EventHookNotificationService,
  ],
  exports: [NotificationHelper, NotificationService],
})
export class NotificationModule {}
