import { Module } from "@nestjs/common";
import { CallKitController } from "./controllers/face_detection";
import { MongooseModule } from "@nestjs/mongoose";
import { UserService } from "../user/services/user.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { NotificationService } from "../notification/services/notification.service";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserOptionService } from "../user/services/user_option.service";
import { UserBlockService } from "../user/services/user_block.service";
import { UserBlock, UserBlockSchema } from "../user/schemas/user_block.schema";
import { FaceDetectionHelper } from "./helper/face_detection.helper";
import { FaceDetectionService } from "./services/face_detection.service";
import { FaceDetection, FaceDetectionSchema } from "./schemas/face_detection.schema";
import { UserAnonymous, UserAnonymousSchema } from "../user/schemas/user_anonymous.schema";
import { UserAnonymousService } from "../user/services/user_anonymous.service";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { ChannelService } from "../channel/services/channel.service";
import { GiftService } from "../gift/services/gift.service";
import { Channel } from "diagnostics_channel";
import { ChannelSchema } from "../channel/schemas/channel.schema";
import { Gift, GiftSchema } from "../gift/schemas/gift.schema";
import { ChannelPermission, ChannelPermissionSchema } from "../channel/schemas/channel_permission.schema";
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: UserBlock.name, schema: UserBlockSchema },
      { name: FaceDetection.name, schema: FaceDetectionSchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema }
    ]),
  ],
  controllers: [CallKitController],
  providers: [
    NotificationHelper,
    NotificationService,
    FaceDetectionHelper,
    FaceDetectionService,
    UserAnonymousService,
    UserOptionService,
    UserBlockService,
    ChatMediaService,
    UserService,
    UserPermissionService,
    UserSessionService,
    JwtHelperService,
    ChannelService,
    GiftService,
  ],
  exports: [FaceDetectionHelper, FaceDetectionService],
})
export class FaceDetectionModule { }
