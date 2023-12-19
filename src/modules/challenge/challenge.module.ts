import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ChallengeService } from "./services/challenge.service";
import { Challenge, ChallengeSchema } from "./schemas/challenge.schema";
import { ChallengeHelper } from "./helper/challenge.helper";
import { ChallengeController } from "./controllers/challenge.controller";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { ChallengePermission, ChallengePermissionSchema } from "./schemas/challenge_permission.schema";
import { ChallengeView, ChallengeViewSchema } from "./schemas/challenge_view.schema";
import { ChallengeViewService } from "./services/challenge_view.service";
import { ChallengePermissionService } from "./services/challenge_permission.service";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserOptionService } from "../user/services/user_option.service";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";
import { ChallengeGame, ChallengeGameSchema } from "./schemas/challenge_game.schema";
import { ChallengeGameService } from "./services/challenge_game.service";
import { ChannelPermission, ChannelPermissionSchema } from "../channel/schemas/channel_permission.schema";
import { ChannelLevel, ChannelLevelSchema } from "../channel/schemas/channel_level.schema";
import { Channel } from "diagnostics_channel";
import { ChannelSchema } from "../channel/schemas/channel.schema";
import { ChannelPermissionService } from "../channel/services/channel_permission.service";
import { ChannelPointHistory, ChannelPointHistorySchema } from "../channel/schemas/channel_point_history.schema";
import { ChallengeNotification, ChallengeNotificationSchema } from "./schemas/challenge_notification.schema";
import { ChallengeNotificationService } from "./services/challenge_notification.service";
import { ChallengeActivity, ChallengeActivitySchema } from "./schemas/challenge_activity.schema";
import { ChallengeActivityService } from "./services/challenge_activity.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserService } from "../user/services/user.service";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { NotificationService } from "../notification/services/notification.service";
import { RedeemPermission, RedeemPermissionSchema } from "../redeem/schemas/redeem_permission.schema";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { Request, RequestSchema } from "../request/schemas/request.schema";
import { RequestService } from "../request/services/request.service";
import { BullModule } from "@nestjs/bull";
import { QueueService } from "../queue/queue.service";
import { GiftService } from "../gift/services/gift.service";
import { UserGiftService } from "../gift/services/user_gift.service";
import { Gift, GiftSchema } from "../gift/schemas/gift.schema";
import { UserGift, UserGiftSchema } from "../gift/schemas/user_gift.schema";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { ChannelService } from "../channel/services/channel.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { Redeem, RedeemSchema } from "../redeem/schemas/redeem.schema";
import { RedeemMission, RedeemMissionSchema } from "../redeem/schemas/redeem_mission.schema";
import { GiftHelper } from "../gift/helper/gift.helper";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionBank, TransactionBankSchema } from "../transaction/schemas/transaction_bank.schema";
import { ChatHistory, ChatHistorySchema } from "../chat_history/schemas/chat_history.schema";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { TransactionService } from "../transaction/services/transaction.service";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { ChatRoomService } from "../chat_room/services/chat_room.service";

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
      { name: Challenge.name, schema: ChallengeSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: ChallengePermission.name, schema: ChallengePermissionSchema },
      { name: ChallengeView.name, schema: ChallengeViewSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: ChallengeGame.name, schema: ChallengeGameSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema },
      { name: ChannelLevel.name, schema: ChannelLevelSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: ChannelPointHistory.name, schema: ChannelPointHistorySchema },
      { name: ChallengeNotification.name, schema: ChallengeNotificationSchema },
      { name: ChallengeActivity.name, schema: ChallengeActivitySchema },
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: RedeemPermission.name, schema: RedeemPermissionSchema },
      { name: Request.name, schema: RequestSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: UserGift.name, schema: UserGiftSchema },
      { name: Redeem.name, schema: RedeemSchema },
      { name: RedeemMission.name, schema: RedeemMissionSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
  ],
  controllers: [ChallengeController],
  providers: [
    RequestService,
    UserService,
    NotificationHelper,
    NotificationService,
    ChallengeActivityService,
    ChannelPermissionService,
    ChallengeNotificationService,
    ChallengeService,
    ChallengeHelper,
    ChallengeViewService,
    UserOptionService,
    ChallengePermissionService,
    UserSessionService,
    UserPermissionService,
    ChatMediaService,
    ChallengeGameService,
    JwtHelperService,
    QueueService,
    GiftService,
    UserGiftService,
    EventHookWorkerService,
    ChannelService,
    EventHookNotificationService,
    GiftHelper,
    TransactionHelper,
    ChatHistoryHelper,
    TransactionService,
    TransactionBankService,
    ChatHistoryService,
    ChatRoomUserOptionService,
    ChatRoomService,
  ],
  exports: [
    ChallengeHelper,
    ChallengeActivityService,
    ChallengeGameService,
    ChallengePermissionService,
    ChallengeViewService,
    ChallengeService,
    MongooseModule.forFeature([{ name: ChannelPermission.name, schema: ChannelPermissionSchema }]),
  ],
})
export class ChallengeModule {}
