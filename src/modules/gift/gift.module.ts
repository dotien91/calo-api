import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserService } from "../user/services/user.service";
import { GiftService } from "./services/gift.service";
import { GiftController } from "./controllers/gift.controller";
import { Gift, GiftSchema } from "./schemas/gift.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { GiftHelper } from "./helper/gift.helper";
import { JwtHelperService } from "../../modules/core/services/jwt_helper.service";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserOptionService } from "../user/services/user_option.service";
import { UserGift, UserGiftSchema } from "./schemas/user_gift.schema";
import { UserGiftService } from "./services/user_gift.service";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { TransactionService } from "../transaction/services/transaction.service";
import { ChatHistory, ChatHistorySchema } from "../chat_history/schemas/chat_history.schema";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { ChatRoomService } from "../chat_room/services/chat_room.service";
import { ChatRoomHelper } from "../chat_room/helpers/chat_room.helper";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { UserMood, UserMoodSchema } from "../user/schemas/user_mood.schema";
import { TopicJoin, TopicJoinSchema } from "../topic/schemas/topic_join.schema";
import { Topic, TopicSchema } from "../topic/schemas/topic.schema";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { TopicService } from "../topic/services/topic.service";
import { TopicJoinService } from "../topic/services/topic_join.service";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationService } from "../notification/services/notification.service";
import { UserFollow, UserFollowSchema } from "../user/schemas/user_follow.schema";
import { UserFollowService } from "../user/services/user_follow.service";
import { UserAnonymous, UserAnonymousSchema } from "../user/schemas/user_anonymous.schema";
import { UserAnonymousService } from "../user/services/user_anonymous.service";
import { ChannelPermission, ChannelPermissionSchema } from "../channel/schemas/channel_permission.schema";
import { ChannelLevel, ChannelLevelSchema } from "../channel/schemas/channel_level.schema";
import { ChannelPermissionService } from "../channel/services/channel_permission.service";
import { Channel, ChannelSchema } from "../channel/schemas/channel.schema";
import { ChannelPointHistory, ChannelPointHistorySchema } from "../channel/schemas/channel_point_history.schema";
import { TransactionBank, TransactionBankSchema } from "../transaction/schemas/transaction_bank.schema";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { ChannelService } from "../channel/services/channel.service";

import { RedeemPermission, RedeemPermissionSchema } from "../redeem/schemas/redeem_permission.schema";
import { BullModule } from "@nestjs/bull";
import { QueueService } from "../queue/queue.service";
import { ChallengePermissionService } from "../challenge/services/challenge_permission.service";
import { ChallengePermission, ChallengePermissionSchema } from "../challenge/schemas/challenge_permission.schema";
import { ChallengeActivity, ChallengeActivitySchema } from "../challenge/schemas/challenge_activity.schema";
import { ChallengeActivityService } from "../challenge/services/challenge_activity.service";
import { ChallengeService } from "../challenge/services/challenge.service";
import { Challenge, ChallengeSchema } from "../challenge/schemas/challenge.schema";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { Redeem, RedeemSchema } from "../redeem/schemas/redeem.schema";
import { RedeemMission, RedeemMissionSchema } from "../redeem/schemas/redeem_mission.schema";
import { ChannelModule } from "../channel/channel.module";

@Module({
  imports: [
    forwardRef(() => ChannelModule),
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
      { name: User.name, schema: UserSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: UserGift.name, schema: UserGiftSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
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
      { name: Notification.name, schema: NotificationSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema },
      { name: ChannelLevel.name, schema: ChannelLevelSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: ChannelPointHistory.name, schema: ChannelPointHistorySchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: RedeemPermission.name, schema: RedeemPermissionSchema },
      { name: ChallengePermission.name, schema: ChallengePermissionSchema },
      { name: ChallengeActivity.name, schema: ChallengeActivitySchema },
      { name: Challenge.name, schema: ChallengeSchema },
      { name: Redeem.name, schema: RedeemSchema },
      { name: RedeemMission.name, schema: RedeemMissionSchema },
    ]),
  ],
  controllers: [GiftController],
  providers: [
    ChannelPermissionService,
    TransactionBankService,
    UserService,
    GiftHelper,
    JwtHelperService,
    UserSessionService,
    UserPermissionService,
    ChatHistoryService,
    ChatMediaService,
    ChatRoomService,
    UserOptionService,
    UserGiftService,
    GiftService,
    TransactionHelper,
    TransactionService,
    ChatRoomHelper,
    ChatRoomService,
    TopicJoinService,
    UserService,
    TopicService,
    UserOptionService,
    JwtHelperService,
    UserSessionService,
    UserPermissionService,
    TransactionService,
    ChatHistoryService,
    ChatMediaService,
    ChatHistoryHelper,
    NotificationHelper,
    NotificationService,
    UserFollowService,
    UserAnonymousService,
    ChannelService,
    QueueService,
    ChatRoomUserOptionService,
    ChallengePermissionService,
    ChallengeActivityService,
    ChallengeService,
    EventHookWorkerService,
    EventHookNotificationService,
  ],
  exports: [GiftHelper, GiftService, UserGiftService],
})
export class GiftModule {}
