import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ChannelService } from "./services/channel.service";
import { Channel, ChannelSchema } from "./schemas/channel.schema";
import { ChannelHelper } from "./helper/channel.helper";
import { ChannelController } from "./controllers/channel.controller";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { ChannelLike, ChannelLikeSchema } from "./schemas/channel_like.schema";
import { ChannelPermission, ChannelPermissionSchema } from "./schemas/channel_permission.schema";
import { ChannelPermissionService } from "./services/channel_permission.service";
import { ChannelLikeService } from "./services/channel_like.service";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserOptionService } from "../user/services/user_option.service";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";
import { ChannelLevel, ChannelLevelSchema } from "./schemas/channel_level.schema";
import { ChannelLevelService } from "./services/channel_level.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserService } from "../user/services/user.service";
import { UserFollow, UserFollowSchema } from "../user/schemas/user_follow.schema";
import { UserFollowService } from "../user/services/user_follow.service";
import { ChannelPointHistory, ChannelPointHistorySchema } from "./schemas/channel_point_history.schema";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { NotificationService } from "../notification/services/notification.service";
import { ChannelBanner, ChannelBannerSchema } from "./schemas/channel_banner.schema";
import { ChannelBannerService } from "./services/channel_banner.service";
import { Subscribe, SubscribeSchema } from "../subscribe/schemas/subscribe.schema";
import { SubscribeService } from "../subscribe/services/subscribe.service";
import { RedeemPermission, RedeemPermissionSchema } from "../redeem/schemas/redeem_permission.schema";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { GiftService } from "../gift/services/gift.service";
import { BullModule } from "@nestjs/bull";
import { Gift, GiftSchema } from "../gift/schemas/gift.schema";
import { UserGift, UserGiftSchema } from "../gift/schemas/user_gift.schema";
import { UserGiftService } from "../gift/services/user_gift.service";
import { QueueService } from "../queue/queue.service";
import { ChallengePermissionService } from "../challenge/services/challenge_permission.service";
import { ChallengePermission, ChallengePermissionSchema } from "../challenge/schemas/challenge_permission.schema";
import { ChallengeActivityService } from "../challenge/services/challenge_activity.service";
import { ChallengeActivity, ChallengeActivitySchema } from "../challenge/schemas/challenge_activity.schema";
import { Challenge, ChallengeSchema } from "../challenge/schemas/challenge.schema";
import { ChallengeService } from "../challenge/services/challenge.service";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { Redeem, RedeemSchema } from "../redeem/schemas/redeem.schema";
import { GiftModule } from "../gift/gift.module";
import { RedeemMission, RedeemMissionSchema } from "../redeem/schemas/redeem_mission.schema";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { TransactionModule } from "../transaction/transaction.module";
import { GiftHelper } from "../gift/helper/gift.helper";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { ChatRoomService } from "../chat_room/services/chat_room.service";
import { ChatHistory, ChatHistorySchema } from "../chat_history/schemas/chat_history.schema";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";
import { CourseLike, CourseLikeSchema } from "../course/schemas/course_like.schema";
import { CourseLikeService } from "../course/services/course_like.service";

@Module({
  imports: [
    forwardRef(() => TransactionModule), forwardRef(() => GiftModule)
    ,
    BullModule.registerQueueAsync(
      {
        name: 'gift'
      },
      {
        name: 'noti'
      },
      {
        name: 'challenge'
      }),
    MongooseModule.forFeature([
      { name: Channel.name, schema: ChannelSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: ChannelLike.name, schema: ChannelLikeSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: ChannelLevel.name, schema: ChannelLevelSchema },
      { name: User.name, schema: UserSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: ChannelPointHistory.name, schema: ChannelPointHistorySchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: ChannelBanner.name, schema: ChannelBannerSchema },
      { name: Subscribe.name, schema: SubscribeSchema },
      { name: ChannelBanner.name, schema: ChannelBannerSchema },
      { name: RedeemPermission.name, schema: RedeemPermissionSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: UserGift.name, schema: UserGiftSchema },
      { name: ChallengePermission.name, schema: ChallengePermissionSchema },
      { name: ChallengeActivity.name, schema: ChallengeActivitySchema },
      { name: Challenge.name, schema: ChallengeSchema },
      { name: Redeem.name, schema: RedeemSchema },
      { name: RedeemMission.name, schema: RedeemMissionSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: CourseLike.name, schema: CourseLikeSchema }
    ]),
  ],
  controllers: [ChannelController],
  providers: [
    CourseLikeService,
    ChannelBannerService,
    ChannelService,
    NotificationHelper,
    NotificationService,
    ChannelHelper,
    ChannelPermissionService,
    UserOptionService,
    UserService,
    ChannelLikeService,
    UserSessionService,
    UserPermissionService,
    ChatMediaService,
    ChannelLevelService,
    UserFollowService,
    SubscribeService,
    JwtHelperService,
    GiftService,
    UserGiftService,
    GiftHelper,
    ChallengePermissionService,
    QueueService,
    ChallengeActivityService,
    ChallengeService,
    EventHookWorkerService,
    EventHookNotificationService,
    TransactionHelper,
    ChatHistoryHelper,
    ChatHistoryService,
    ChatRoomUserOptionService,
    ChatRoomService,
  ],
  exports: [ChannelHelper, ChannelLevelService, ChannelService, ChannelLikeService, ChannelPermissionService, ChannelBannerService],
})
export class ChannelModule { }
