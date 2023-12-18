import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RedeemService } from "./services/redeem.service";
import { Redeem, RedeemSchema } from "./schemas/redeem.schema";
import { RedeemHelper } from "./helper/redeem.helper";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { RedeemController } from "./controllers/redeem.controller";
import { UserAnonymousSession, UserAnonymousSessionSchema } from "../user/schemas/user_anonymous_session.schema";
import { UserAnonymousSessionService } from "../user/services/user_anonymous_session.service";
import { UserAnonymous, UserAnonymousSchema } from "../user/schemas/user_anonymous.schema";
import { UserAnonymousService } from "../user/services/user_anonymous.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserService } from "../user/services/user.service";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationService } from "../notification/services/notification.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserOptionService } from "../user/services/user_option.service";
import { ChannelPermission, ChannelPermissionSchema } from "../channel/schemas/channel_permission.schema";
import { ChannelLevel, ChannelLevelSchema } from "../channel/schemas/channel_level.schema";
import { ChannelLevelService } from "../channel/services/channel_level.service";
import { ChannelPermissionService } from "../channel/services/channel_permission.service";
import { UserFollow, UserFollowSchema } from "../user/schemas/user_follow.schema";
import { UserFollowService } from "../user/services/user_follow.service";
import { Channel, ChannelSchema } from "../channel/schemas/channel.schema";
import { ChannelService } from "../channel/services/channel.service";
import { ChannelPointHistory, ChannelPointHistorySchema } from "../channel/schemas/channel_point_history.schema";
import { RedeemMission, RedeemMissionSchema } from "./schemas/redeem_mission.schema";
import { RedeemHistoryService } from "./services/redeem_history.service";
import { RedeemPermissionService } from "./services/redeem_permission.service";
import { RedeemHistory, RedeemHistorySchema } from "./schemas/redeem_history.schema";
import { RedeemPermission, RedeemPermissionSchema } from "./schemas/redeem_permission.schema";
import { JwtHelperService } from "../core/services/jwt_helper.service";
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
import { GiftHelper } from "../gift/helper/gift.helper";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { TransactionService } from "../transaction/services/transaction.service";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { ChatRoomService } from "../chat_room/services/chat_room.service";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionBank, TransactionBankSchema } from "../transaction/schemas/transaction_bank.schema";
import { ChatHistory, ChatHistorySchema } from "../chat_history/schemas/chat_history.schema";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";

@Module({
  imports: [
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
      { name: Redeem.name, schema: RedeemSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: UserAnonymousSession.name, schema: UserAnonymousSessionSchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema },
      { name: ChannelLevel.name, schema: ChannelLevelSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: ChannelPointHistory.name, schema: ChannelPointHistorySchema },
      { name: RedeemMission.name, schema: RedeemMissionSchema },
      { name: RedeemHistory.name, schema: RedeemHistorySchema },
      { name: RedeemPermission.name, schema: RedeemPermissionSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: UserGift.name, schema: UserGiftSchema },
      { name: ChallengePermission.name, schema: ChallengePermissionSchema },
      { name: ChallengeActivity.name, schema: ChallengeActivitySchema },
      { name: Challenge.name, schema: ChallengeSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
    ]),
  ],
  controllers: [RedeemController],
  providers: [
    RedeemHistoryService,
    RedeemPermissionService,
    ChannelService,
    UserSessionService,
    NotificationService,
    NotificationHelper,
    RedeemService,
    RedeemHelper,
    UserPermissionService,
    UserAnonymousService,
    UserService,
    RedeemService,
    UserAnonymousSessionService,
    UserOptionService,
    ChannelLevelService,
    ChannelPermissionService,
    UserFollowService,
    JwtHelperService,
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
    TransactionService,
    TransactionBankService,
    ChatHistoryService,
    ChatRoomUserOptionService,
    ChatRoomService,
    ChatMediaService,
    EventHookNotificationService,
  ],
  exports: [RedeemHelper, RedeemHistoryService, RedeemPermissionService, RedeemService],
})
export class RedeemModule { }
