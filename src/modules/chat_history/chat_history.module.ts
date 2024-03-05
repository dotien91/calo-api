import { Module } from "@nestjs/common";
import { JwtHelperService } from "../../modules/core/services/jwt_helper.service";
import { ChatRoomService } from "../chat_room/services/chat_room.service";
import { MediaService } from "../media/services/media.service";
import { ChatHistoryController } from "./controllers/chat_history.controller";
import { ChatHistoryService } from "./services/chat_history.service";

import { BullModule } from "@nestjs/bull";
import { MongooseModule } from "@nestjs/mongoose";
import { ChatRoomHelper } from "../chat_room/helpers/chat_room.helper";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { Media, MediaSchema } from "../media/schemas/media.schema";
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
import { UserPointHistory, UserPointHistorySchema } from "../user/schemas/user_point_history.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserService } from "../user/services/user.service";
import { UserAnonymousService } from "../user/services/user_anonymous.service";
import { UserFollowService } from "../user/services/user_follow.service";
import { UserPointHistoryService } from "../user/services/user_point_history.service";
import { UserSessionService } from "../user/services/user_session.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { ChatHistoryHelper } from "./helpers/chat_history.helper";
import { ChatHistory, ChatHistorySchema } from "./schemas/chat_history.schema";

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
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: Media.name, schema: MediaSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: UserPointHistory.name, schema: UserPointHistorySchema },
      { name: Referral.name, schema: ReferralSchema },
    ]),
    SocketModule,
  ],
  controllers: [ChatHistoryController],
  providers: [
    TransactionBankService,
    ChatHistoryService,
    MediaService,
    UserAnonymousService,
    ChatRoomService,
    TransactionService,
    TransactionHelper,
    JwtHelperService,
    UserService,
    ChatRoomHelper,
    ChatRoomUserOptionService,
    ChatHistoryHelper,
    UserSessionService,
    UserPermissionService,
    NotificationHelper,
    NotificationService,
    UserFollowService,
    QueueService,
    EventHookWorkerService,
    EventHookNotificationService,
    UserPointHistoryService,
    ReferralService,
  ],
  exports: [ChatHistoryHelper, ChatHistoryService],
})
export class ChatHistoryModule {}
