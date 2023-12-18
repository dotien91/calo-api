import { Module } from "@nestjs/common";
import { CallKitController } from "./controllers/call_kit.controller";
import { CallKitHelper } from "./helper/call_kit.helper";

import { MongooseModule } from "@nestjs/mongoose";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";
import { UserService } from "../user/services/user.service";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { ChatHistory, ChatHistorySchema } from "../../modules/chat_history/schemas/chat_history.schema";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { NotificationService } from "../notification/services/notification.service";
import { CallkitService } from "./services/callkit.service";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { Callkit, CallkitSchema } from "./schemas/callkit.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { UserBlock, UserBlockSchema } from "../user/schemas/user_block.schema";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserOptionService } from "../user/services/user_option.service";
import { UserBlockService } from "../user/services/user_block.service";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { ChatRoomService } from "../chat_room/services/chat_room.service";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { TransactionService } from "../transaction/services/transaction.service";
import { UserMood, UserMoodSchema } from "../user/schemas/user_mood.schema";
import { TopicJoin, TopicJoinSchema } from "../topic/schemas/topic_join.schema";
import { Topic, TopicSchema } from "../topic/schemas/topic.schema";
import { TopicJoinService } from "../topic/services/topic_join.service";
import { TopicService } from "../topic/services/topic.service";
import { ChatRoomHelper } from "../chat_room/helpers/chat_room.helper";
import { UserFollowService } from "../user/services/user_follow.service";
import { UserFollow, UserFollowSchema } from "../user/schemas/user_follow.schema";
import { UserAnonymous, UserAnonymousSchema } from "../user/schemas/user_anonymous.schema";
import { UserAnonymousService } from "../user/services/user_anonymous.service";
import { ChannelPermission, ChannelPermissionSchema } from "../channel/schemas/channel_permission.schema";
import { ChannelLevel, ChannelLevelSchema } from "../channel/schemas/channel_level.schema";
import { ChannelPermissionService } from "../channel/services/channel_permission.service";
import { Channel, ChannelSchema } from "../channel/schemas/channel.schema";
import { ChannelPointHistory, ChannelPointHistorySchema } from "../channel/schemas/channel_point_history.schema";
import { TransactionBank, TransactionBankSchema } from "../transaction/schemas/transaction_bank.schema";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { RedeemPermission, RedeemPermissionSchema } from "../redeem/schemas/redeem_permission.schema";
import { BullModule } from "@nestjs/bull";
import { QueueService } from "../queue/queue.service";
import { GiftService } from "../gift/services/gift.service";
import { UserGiftService } from "../gift/services/user_gift.service";
import { Gift, GiftSchema } from "../gift/schemas/gift.schema";
import { UserGift, UserGiftSchema } from "../gift/schemas/user_gift.schema";
import { ChallengePermissionService } from "../challenge/services/challenge_permission.service";
import { ChallengePermission, ChallengePermissionSchema } from "../challenge/schemas/challenge_permission.schema";
import { ChallengeActivity, ChallengeActivitySchema } from "../challenge/schemas/challenge_activity.schema";
import { ChallengeActivityService } from "../challenge/services/challenge_activity.service";
import { ChallengeService } from "../challenge/services/challenge.service";
import { Challenge, ChallengeSchema } from "../challenge/schemas/challenge.schema";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { ChannelService } from "../channel/services/channel.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { Redeem, RedeemSchema } from "../redeem/schemas/redeem.schema";
import { TransactionModule } from "../transaction/transaction.module";
import { RedeemMission, RedeemMissionSchema } from "../redeem/schemas/redeem_mission.schema";
import { GiftModule } from "../gift/gift.module";
import { GiftHelper } from "../gift/helper/gift.helper";

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
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: Callkit.name, schema: CallkitSchema },
      { name: UserBlock.name, schema: UserBlockSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: UserMood.name, schema: UserMoodSchema },
      { name: TopicJoin.name, schema: TopicJoinSchema },
      { name: Topic.name, schema: TopicSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema },
      { name: ChannelLevel.name, schema: ChannelLevelSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: ChannelPointHistory.name, schema: ChannelPointHistorySchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: RedeemPermission.name, schema: RedeemPermissionSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: UserGift.name, schema: UserGiftSchema },
      { name: ChallengePermission.name, schema: ChallengePermissionSchema },
      { name: ChallengeActivity.name, schema: ChallengeActivitySchema },
      { name: Challenge.name, schema: ChallengeSchema },
      { name: Redeem.name, schema: RedeemSchema },
      { name: RedeemMission.name, schema: RedeemMissionSchema },
    ]),
  ],
  controllers: [CallKitController],
  providers: [
    ChannelPermissionService,
    TransactionBankService,
    CallKitHelper,
    ChatRoomService,
    TransactionHelper,
    TransactionService,
    ChatRoomUserOptionService,
    UserAnonymousService,
    JwtHelperService,
    NotificationHelper,
    ChatHistoryService,
    ChatHistoryHelper,
    NotificationService,
    UserOptionService,
    UserBlockService,
    CallkitService,
    ChatMediaService,
    UserService,
    UserPermissionService,
    UserSessionService,
    TopicJoinService,
    TopicService,
    ChatRoomHelper,
    UserFollowService,
    QueueService,
    GiftService,
    UserGiftService,
    ChallengePermissionService,
    ChallengeActivityService,
    ChallengeService,
    EventHookWorkerService,
    ChannelService,
    EventHookNotificationService,
    GiftHelper,
  ],
  exports: [CallKitHelper, CallkitService],
})
export class CallKitModule { }
