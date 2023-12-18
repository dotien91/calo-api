import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TransactionService } from "./services/transaction.service";
import { Transaction, TransactionSchema } from "./schemas/transaction.schema";
import { TransactionHelper } from "./helper/transaction.helper";
import { TransactionController } from "./controllers/transaction.controller";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserOptionService } from "../user/services/user_option.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserService } from "../user/services/user.service";
import { ChannelPermission, ChannelPermissionSchema } from "../channel/schemas/channel_permission.schema";
import { ChannelPermissionService } from "../channel/services/channel_permission.service";
import { ChannelLevel, ChannelLevelSchema } from "../channel/schemas/channel_level.schema";
import { ChannelLevelService } from "../channel/services/channel_level.service";
import { Channel, ChannelSchema } from "../channel/schemas/channel.schema";
import { ChannelService } from "../channel/services/channel.service";
import { ChannelPointHistory, ChannelPointHistorySchema } from "../channel/schemas/channel_point_history.schema";
import { TransactionBank, TransactionBankSchema } from "./schemas/transaction_bank.schema";
import { TransactionBankService } from "./services/transaction_bank.service";
import { RedeemPermission, RedeemPermissionSchema } from "../redeem/schemas/redeem_permission.schema";
import { BullModule } from "@nestjs/bull";
import { QueueService } from "../queue/queue.service";
import { GiftService } from "../gift/services/gift.service";
import { UserGiftService } from "../gift/services/user_gift.service";
import { Gift, GiftSchema } from "../gift/schemas/gift.schema";
import { UserGift, UserGiftSchema } from "../gift/schemas/user_gift.schema";
import { ChallengePermission, ChallengePermissionSchema } from "../challenge/schemas/challenge_permission.schema";
import { ChallengePermissionService } from "../challenge/services/challenge_permission.service";
import { ChallengeActivityService } from "../challenge/services/challenge_activity.service";
import { ChallengeActivity, ChallengeActivitySchema } from "../challenge/schemas/challenge_activity.schema";
import { Challenge, ChallengeSchema } from "../challenge/schemas/challenge.schema";
import { ChallengeService } from "../challenge/services/challenge.service";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { NotificationService } from "../notification/services/notification.service";
import { UserSessionService } from "../user/services/user_session.service";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { Redeem, RedeemSchema } from "../redeem/schemas/redeem.schema";
import { GiftHelper } from "../gift/helper/gift.helper";
import { RedeemMission, RedeemMissionSchema } from "../redeem/schemas/redeem_mission.schema";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { ChatRoomService } from "../chat_room/services/chat_room.service";
import { ChatHistory, ChatHistorySchema } from "../chat_history/schemas/chat_history.schema";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";
import { ChannelModule } from "../channel/channel.module";

@Module({
  imports: [
    forwardRef(() => ChannelModule),
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
      { name: Transaction.name, schema: TransactionSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: User.name, schema: UserSchema },
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
      { name: Notification.name, schema: NotificationSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: Redeem.name, schema: RedeemSchema },
      { name: RedeemMission.name, schema: RedeemMissionSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
  ],
  controllers: [TransactionController],
  providers: [
    TransactionBankService,
    TransactionService,
    ChannelService,
    TransactionHelper,
    UserPermissionService,
    UserOptionService,
    UserService,
    ChannelPermissionService,
    ChannelLevelService,
    QueueService,
    GiftService,
    UserGiftService,
    ChallengePermissionService,
    ChallengeActivityService,
    ChallengeService,
    EventHookWorkerService,
    EventHookNotificationService,
    NotificationHelper,
    NotificationService,
    UserSessionService,
    JwtHelperService,
    GiftHelper,
    ChatMediaService,
    ChatHistoryHelper,
    ChatHistoryService,
    ChatRoomUserOptionService,
    ChatRoomService,
  ],
  exports: [TransactionHelper, TransactionBankService, TransactionService],
})
export class TransactionModule { }
