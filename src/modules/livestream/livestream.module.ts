import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LivestreamService } from "./services/livestream.service";
import { Livestream, LivestreamSchema } from "./schemas/livestream.schema";
import { LivestreamHelper } from "./helper/livestream.helper";
import { LivestreamController } from "./controllers/livestream.controller";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { LivestreamLike, LivestreamLikeSchema } from "./schemas/livestream_like.schema";
import { LivestreamView, LivestreamViewSchema } from "./schemas/livestream_view.schema";
import { LivestreamViewService } from "./services/livestream_view.service";
import { LivestreamLikeService } from "./services/livestream_like.service";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserOptionService } from "../user/services/user_option.service";
import { LivestreamComment, LivestreamCommentSchema } from "./schemas/livestream_comment.schema";
import { LivestreamCommentService } from "./services/livestream_comment.service";
import { ChannelPermission, ChannelPermissionSchema } from "../channel/schemas/channel_permission.schema";
import { Event, EventSchema } from "../event/schemas/event.schema";
import { ChannelPermissionService } from "../channel/services/channel_permission.service";
import { EventService } from "../event/services/event.service";
import { ChannelLevel } from "../channel/schemas/channel_level.schema";
import { Channel, ChannelSchema } from "../channel/schemas/channel.schema";
import { ChannelPointHistory, ChannelPointHistorySchema } from "../channel/schemas/channel_point_history.schema";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { NotificationService } from "../notification/services/notification.service";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";
import { ChannelService } from "../channel/services/channel.service";
import { RedeemPermission, RedeemPermissionSchema } from "../redeem/schemas/redeem_permission.schema";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { UserService } from "../user/services/user.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { Request, RequestSchema } from "../request/schemas/request.schema";
import { RequestService } from "../request/services/request.service";
import { QueueService } from "../queue/queue.service";
import { BullModule } from "@nestjs/bull";
import { Gift, GiftSchema } from "../gift/schemas/gift.schema";
import { UserGift, UserGiftSchema } from "../gift/schemas/user_gift.schema";
import { GiftService } from "../gift/services/gift.service";
import { UserGiftService } from "../gift/services/user_gift.service";
import { ChallengePermissionService } from "../challenge/services/challenge_permission.service";
import { ChallengePermission, ChallengePermissionSchema } from "../challenge/schemas/challenge_permission.schema";
import { ChallengeActivity, ChallengeActivitySchema } from "../challenge/schemas/challenge_activity.schema";
import { ChallengeActivityService } from "../challenge/services/challenge_activity.service";
import { ChallengeService } from "../challenge/services/challenge.service";
import { Challenge, ChallengeSchema } from "../challenge/schemas/challenge.schema";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { Redeem, RedeemSchema } from "../redeem/schemas/redeem.schema";
import { GiftHelper } from "../gift/helper/gift.helper";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { TransactionModule } from "../transaction/transaction.module";
import { RedeemMission, RedeemMissionSchema } from "../redeem/schemas/redeem_mission.schema";
import { GiftModule } from "../gift/gift.module";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { ChatRoomService } from "../chat_room/services/chat_room.service";
import { ChatHistory, ChatHistorySchema } from "../chat_history/schemas/chat_history.schema";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";
import { TransactionService } from "../transaction/services/transaction.service";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionBank, TransactionBankSchema } from "../transaction/schemas/transaction_bank.schema";

@Module({
  imports: [
    BullModule.registerQueueAsync(
      {
        name: "gift",
      },
      {
        name: "noti",
      },
      {
        name: "challenge",
      }
    ),
    MongooseModule.forFeature([
      { name: Livestream.name, schema: LivestreamSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: LivestreamLike.name, schema: LivestreamLikeSchema },
      { name: LivestreamView.name, schema: LivestreamViewSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: LivestreamComment.name, schema: LivestreamCommentSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema },
      { name: Event.name, schema: EventSchema },
      { name: ChannelLevel.name, schema: ChannelLevel.name },
      { name: Channel.name, schema: ChannelSchema },
      { name: ChannelPointHistory.name, schema: ChannelPointHistorySchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: RedeemPermission.name, schema: RedeemPermissionSchema },
      { name: User.name, schema: UserSchema },
      { name: Request.name, schema: RequestSchema },
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
      { name: Transaction.name, schema: TransactionSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
    ]),
  ],
  controllers: [LivestreamController],
  providers: [
    RequestService,
    UserSessionService,
    ChannelService,
    NotificationHelper,
    NotificationService,
    ChannelPermissionService,
    EventService,
    LivestreamService,
    LivestreamHelper,
    LivestreamViewService,
    UserOptionService,
    LivestreamLikeService,
    UserPermissionService,
    ChatMediaService,
    LivestreamCommentService,
    JwtHelperService,
    UserService,
    QueueService,
    GiftService,
    UserGiftService,
    ChallengePermissionService,
    ChallengeActivityService,
    ChallengeService,
    EventHookWorkerService,
    GiftHelper,
    TransactionHelper,
    ChatHistoryHelper,
    EventHookNotificationService,
    ChatHistoryService,
    ChatRoomUserOptionService,
    ChatRoomService,
    TransactionService,
    TransactionBankService,
  ],
  exports: [
    LivestreamHelper,
    LivestreamCommentService,
    LivestreamLikeService,
    LivestreamViewService,
    LivestreamService,
  ],
})
export class LivestreamModule {}
