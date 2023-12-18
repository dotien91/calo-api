import { Module } from "@nestjs/common";
import { ChatRoomService } from "./services/chat_room.service";
import { ChatRoomController } from "./controllers/chat_room.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { ChatRoom, ChatRoomSchema } from "./schemas/chat_room.schema";
import { UserService } from "../user/services/user.service";
import { ChatRoomUserOptionService } from "./services/chat_room_user_option.service";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "./schemas/chat_room_user_option.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { ChatRoomHelper } from "./helpers/chat_room.helper";
import { UserSessionService } from "../user/services/user_session.service";
import { ChatHistory, ChatHistorySchema } from "../../modules/chat_history/schemas/chat_history.schema";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { UserMood, UserMoodSchema } from "../user/schemas/user_mood.schema";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { TransactionService } from "../transaction/services/transaction.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserOptionService } from "../user/services/user_option.service";
import { TopicJoin, TopicJoinSchema } from "../topic/schemas/topic_join.schema";
import { TopicJoinService } from "../topic/services/topic_join.service";
import { Topic, TopicSchema } from "../topic/schemas/topic.schema";
import { TopicService } from "../topic/services/topic.service";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { Callkit, CallkitSchema } from "../callkit/schemas/callkit.schema";
import { CallkitService } from "../callkit/services/callkit.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { NotificationService } from "../notification/services/notification.service";
import { UserFollow, UserFollowSchema } from "../user/schemas/user_follow.schema";
import { UserFollowService } from "../user/services/user_follow.service";
import { UserAnonymous, UserAnonymousSchema } from "../user/schemas/user_anonymous.schema";
import { UserAnonymousService } from "../user/services/user_anonymous.service";
import { ChannelPermission, ChannelPermissionSchema } from "../channel/schemas/channel_permission.schema";
import { ChannelPermissionService } from "../channel/services/channel_permission.service";
import { ChannelLevel, ChannelLevelSchema } from "../channel/schemas/channel_level.schema";
import { Channel, ChannelSchema } from "../channel/schemas/channel.schema";
import { ChannelPointHistory, ChannelPointHistorySchema } from "../channel/schemas/channel_point_history.schema";
import { TransactionBank, TransactionBankSchema } from "../transaction/schemas/transaction_bank.schema";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { RedeemPermission, RedeemPermissionSchema } from "../redeem/schemas/redeem_permission.schema";
import { QueueService } from "../queue/queue.service";
import { UserGiftService } from "../gift/services/user_gift.service";
import { BullModule } from "@nestjs/bull";
import { GiftService } from "../gift/services/gift.service";
import { UserGift, UserGiftSchema } from "../gift/schemas/user_gift.schema";
import { Gift, GiftSchema } from "../gift/schemas/gift.schema";
import { ChallengePermissionService } from "../challenge/services/challenge_permission.service";
import { Challenge, ChallengeSchema } from "../challenge/schemas/challenge.schema";
import { ChallengePermission, ChallengePermissionSchema } from "../challenge/schemas/challenge_permission.schema";
import { ChallengeActivityService } from "../challenge/services/challenge_activity.service";
import { ChallengeActivity, ChallengeActivitySchema } from "../challenge/schemas/challenge_activity.schema";
import { ChallengeService } from "../challenge/services/challenge.service";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { ChannelService } from "../channel/services/channel.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { Redeem, RedeemSchema } from "../redeem/schemas/redeem.schema";
import { GiftHelper } from "../gift/helper/gift.helper";
import { TransactionModule } from "../transaction/transaction.module";
import { RedeemMission, RedeemMissionSchema } from "../redeem/schemas/redeem_mission.schema";
import { GiftModule } from "../gift/gift.module";

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
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      { name: User.name, schema: UserSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: UserMood.name, schema: UserMoodSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: TopicJoin.name, schema: TopicJoinSchema },
      { name: Topic.name, schema: TopicSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Callkit.name, schema: CallkitSchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema },
      { name: ChannelLevel.name, schema: ChannelLevelSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: ChannelPointHistory.name, schema: ChannelPointHistorySchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: RedeemPermission.name, schema: RedeemPermissionSchema },
      { name: UserGift.name, schema: UserGiftSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: ChallengePermission.name, schema: ChallengePermissionSchema },
      { name: ChallengeActivity.name, schema: ChallengeActivitySchema },
      { name: Challenge.name, schema: ChallengeSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: Redeem.name, schema: RedeemSchema },
      { name: RedeemMission.name, schema: RedeemMissionSchema },
    ]),
  ],
  controllers: [ChatRoomController],
  providers: [
    ChannelPermissionService,
    TransactionBankService,
    ChatRoomService,
    TopicJoinService,
    UserService,
    TopicService,
    UserOptionService,
    ChatRoomUserOptionService,
    JwtHelperService,
    ChatRoomHelper,
    UserSessionService,
    UserAnonymousService,
    UserPermissionService,
    TransactionHelper,
    TransactionService,
    ChatHistoryService,
    ChatMediaService,
    ChatHistoryHelper,
    CallkitService,
    NotificationHelper,
    NotificationService,
    UserFollowService,
    QueueService,
    UserGiftService,
    GiftService,
    ChallengePermissionService,
    ChallengeActivityService,
    ChallengeService,
    EventHookWorkerService,
    ChannelService,
    EventHookNotificationService,
    GiftHelper,
  ],
  exports: [ChatRoomHelper, ChatRoomService, ChatRoomUserOptionService]
})
export class ChatRoomModule { }
