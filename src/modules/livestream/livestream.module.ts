import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { ChatHistory, ChatHistorySchema } from "../chat_history/schemas/chat_history.schema";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoomService } from "../chat_room/services/chat_room.service";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { JwtHelperService } from "../core/services/jwt_helper.service";
// import { EmailModule } from "../email/email.module";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { Media, MediaSchema } from "../media/schemas/media.schema";
import { MediaService } from "../media/services/media.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationService } from "../notification/services/notification.service";
import { QueueService } from "../queue/queue.service";
import { SocketModule } from "../socket/socket.module";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionBank, TransactionBankSchema } from "../transaction/schemas/transaction_bank.schema";
import { TransactionService } from "../transaction/services/transaction.service";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserService } from "../user/services/user.service";
import { UserSessionService } from "../user/services/user_session.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { LivestreamController } from "./controllers/livestream.controller";
import { LivestreamHelper } from "./helper/livestream.helper";
import { Livestream, LivestreamSchema } from "./schemas/livestream.schema";
import { LivestreamComment, LivestreamCommentSchema } from "./schemas/livestream_comment.schema";
import { LivestreamLike, LivestreamLikeSchema } from "./schemas/livestream_like.schema";
import { LivestreamView, LivestreamViewSchema } from "./schemas/livestream_view.schema";
import { LivestreamService } from "./services/livestream.service";
import { LivestreamCommentService } from "./services/livestream_comment.service";
import { LivestreamLikeService } from "./services/livestream_like.service";
import { LivestreamViewService } from "./services/livestream_view.service";

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
      { name: Media.name, schema: MediaSchema },
      { name: LivestreamLike.name, schema: LivestreamLikeSchema },
      { name: LivestreamView.name, schema: LivestreamViewSchema },
      { name: LivestreamComment.name, schema: LivestreamCommentSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: User.name, schema: UserSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
    ]),
    SocketModule,
  ],
  controllers: [LivestreamController],
  providers: [
    UserSessionService,
    NotificationHelper,
    NotificationService,
    LivestreamService,
    LivestreamHelper,
    LivestreamViewService,
    LivestreamLikeService,
    UserPermissionService,
    MediaService,
    LivestreamCommentService,
    JwtHelperService,
    UserService,
    QueueService,
    EventHookWorkerService,
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
