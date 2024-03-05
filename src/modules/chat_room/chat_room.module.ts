import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ChatHistory, ChatHistorySchema } from "../../modules/chat_history/schemas/chat_history.schema";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { Media, MediaSchema } from "../media/schemas/media.schema";
import { MediaService } from "../media/services/media.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationService } from "../notification/services/notification.service";
import { QueueService } from "../queue/queue.service";
import { Referral, ReferralSchema } from "../referral/schemas/referral.schema";
import { ReferralService } from "../referral/services/referral.service";
import { SocketModule } from "../socket/socket.module";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionBank, TransactionBankSchema } from "../transaction/schemas/transaction_bank.schema";
import { TransactionService } from "../transaction/services/transaction.service";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserAnonymous, UserAnonymousSchema } from "../user/schemas/user_anonymous.schema";
import { UserFollow, UserFollowSchema } from "../user/schemas/user_follow.schema";
import { UserMood, UserMoodSchema } from "../user/schemas/user_mood.schema";
import { UserPointHistory, UserPointHistorySchema } from "../user/schemas/user_point_history.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserService } from "../user/services/user.service";
import { UserAnonymousService } from "../user/services/user_anonymous.service";
import { UserFollowService } from "../user/services/user_follow.service";
import { UserPointHistoryService } from "../user/services/user_point_history.service";
import { UserSessionService } from "../user/services/user_session.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { ChatRoomController } from "./controllers/chat_room.controller";
import { ChatRoomHelper } from "./helpers/chat_room.helper";
import { ChatRoom, ChatRoomSchema } from "./schemas/chat_room.schema";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "./schemas/chat_room_user_option.schema";
import { ChatRoomService } from "./services/chat_room.service";
import { ChatRoomUserOptionService } from "./services/chat_room_user_option.service";

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
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      { name: User.name, schema: UserSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: Media.name, schema: MediaSchema },
      { name: UserMood.name, schema: UserMoodSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: UserPointHistory.name, schema: UserPointHistorySchema },
      { name: Referral.name, schema: ReferralSchema },
    ]),
    SocketModule,
  ],
  controllers: [ChatRoomController],
  providers: [
    TransactionBankService,
    ChatRoomService,
    UserService,
    ChatRoomUserOptionService,
    JwtHelperService,
    ChatRoomHelper,
    UserSessionService,
    UserAnonymousService,
    UserPermissionService,
    TransactionHelper,
    TransactionService,
    ChatHistoryService,
    ChatHistoryHelper,
    NotificationHelper,
    NotificationService,
    UserFollowService,
    QueueService,
    EventHookWorkerService,
    EventHookNotificationService,
    MediaService,
    UserPointHistoryService,
    ReferralService,
  ],
  exports: [ChatRoomHelper, ChatRoomService, ChatRoomUserOptionService],
})
export class ChatRoomModule {}
