import { Module } from "@nestjs/common";
import { CallKitController } from "./controllers/call_kit.controller";
import { CallKitHelper } from "./helper/call_kit.helper";

import { BullModule } from "@nestjs/bull";
import { MongooseModule } from "@nestjs/mongoose";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { ChatHistory, ChatHistorySchema } from "../chat_history/schemas/chat_history.schema";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { ChatRoomHelper } from "../chat_room/helpers/chat_room.helper";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoomService } from "../chat_room/services/chat_room.service";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { Media, MediaSchema } from "../media/schemas/media.schema";
import { MediaService } from "../media/services/media.service";
import { NotificationModule } from "../notification/notification.module";
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
import { UserBlock, UserBlockSchema } from "../user/schemas/user_block.schema";
import { UserFollow, UserFollowSchema } from "../user/schemas/user_follow.schema";
import { UserMood, UserMoodSchema } from "../user/schemas/user_mood.schema";
import { UserPointHistory, UserPointHistorySchema } from "../user/schemas/user_point_history.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserService } from "../user/services/user.service";
import { UserAnonymousService } from "../user/services/user_anonymous.service";
import { UserBlockService } from "../user/services/user_block.service";
import { UserFollowService } from "../user/services/user_follow.service";
import { UserPointHistoryService } from "../user/services/user_point_history.service";
import { UserSessionService } from "../user/services/user_session.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { Callkit, CallkitSchema } from "./schemas/callkit.schema";
import { CallkitService } from "./services/callkit.service";

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
      { name: Media.name, schema: MediaSchema },
      { name: Callkit.name, schema: CallkitSchema },
      { name: UserBlock.name, schema: UserBlockSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: UserMood.name, schema: UserMoodSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: UserPointHistory.name, schema: UserPointHistorySchema },
      { name: Referral.name, schema: ReferralSchema },
    ]),
    SocketModule,
    NotificationModule,
  ],
  controllers: [CallKitController],
  providers: [
    TransactionBankService,
    CallKitHelper,
    ChatRoomService,
    TransactionHelper,
    TransactionService,
    ChatRoomUserOptionService,
    UserAnonymousService,
    JwtHelperService,
    ChatHistoryService,
    ChatHistoryHelper,
    UserBlockService,
    CallkitService,
    MediaService,
    UserService,
    UserPermissionService,
    UserSessionService,
    ChatRoomHelper,
    UserFollowService,
    QueueService,
    EventHookWorkerService,
    EventHookNotificationService,
    UserPointHistoryService,
    ReferralService,
  ],
  exports: [CallKitHelper, CallkitService],
})
export class CallKitModule {}
