import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HttpClientService } from "../../base/http-client/http.base";
import { HttpConfig } from "../../base/http-config/http.config";
import { JwtHelperService } from "../../modules/core/services/jwt_helper.service";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { Config, ConfigSchema } from "../config/schemas/config.schema";
import { ConfigService } from "../config/services/config.service";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationService } from "../notification/services/notification.service";
import { Order, OrderSchema } from "../order/schemas/order.schema";
import { VnpayLog, VnpayLogSchema } from "../order/schemas/vnpay_log.schema";
import { OrderService } from "../order/services/order.service";
import { QueueService } from "../queue/queue.service";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionBank, TransactionBankSchema } from "../transaction/schemas/transaction_bank.schema";
import { TransactionService } from "../transaction/services/transaction.service";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { UserController } from "./controllers/user.controller";
import { UpdateUserHelper } from "./helper/update_user.helper";
import { UserFilterHelper } from "./helper/user_filter.helper";
import { UserLoginHelper } from "./helper/user_login.helper";
import { User, UserSchema } from "./schemas/user.schema";
import { UserAnonymous, UserAnonymousSchema } from "./schemas/user_anonymous.schema";
import { UserAnonymousSession, UserAnonymousSessionSchema } from "./schemas/user_anonymous_session.schema";
import { UserBlock, UserBlockSchema } from "./schemas/user_block.schema";
import { UserDisagree, UserDisagreeSchema } from "./schemas/user_disagree.schema";
import { UserFollow, UserFollowSchema } from "./schemas/user_follow.schema";
import { UserInterest, UserInterestSchema } from "./schemas/user_interest.schema";
import { UserLocationHistory, UserLocationHistorySchema } from "./schemas/user_location_history.schema";
import { UserMood, UserMoodSchema } from "./schemas/user_mood.schema";
import { UserQuestion, UserQuestionSchema } from "./schemas/user_question.schema";
import { UserSession, UserSessionSchema } from "./schemas/user_session.schema";
import { UserView, UserViewSchema } from "./schemas/user_view.schema";
import { UserService } from "./services/user.service";
import { UserAnonymousService } from "./services/user_anonymous.service";
import { UserAnonymousSessionService } from "./services/user_anonymous_session.service";
import { UserBlockService } from "./services/user_block.service";
import { UserDisagreeService } from "./services/user_disagree.service";
import { UserFollowService } from "./services/user_follow.service";
import { UserInterestService } from "./services/user_interest.service";
import { UserLocationService } from "./services/user_location.service";
import { UserMoodService } from "./services/user_mood.service";
import { UserQuestionService } from "./services/user_question.service";
import { UserSessionService } from "./services/user_session.service";
import { UserViewService } from "./services/user_view.service";

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
      { name: User.name, schema: UserSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: UserBlock.name, schema: UserBlockSchema },
      { name: UserView.name, schema: UserViewSchema },
      { name: UserDisagree.name, schema: UserDisagreeSchema },
      { name: UserInterest.name, schema: UserInterestSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: UserMood.name, schema: UserMoodSchema },
      { name: UserQuestion.name, schema: UserQuestionSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Config.name, schema: ConfigSchema },
      { name: UserLocationHistory.name, schema: UserLocationHistorySchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: UserAnonymousSession.name, schema: UserAnonymousSessionSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: VnpayLog.name, schema: VnpayLogSchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [
    TransactionBankService,
    UserService,
    ConfigService,
    UserLoginHelper,
    TransactionService,
    TransactionHelper,
    UpdateUserHelper,
    UserMoodService,
    UserQuestionService,
    UserSessionService,
    JwtHelperService,
    NotificationHelper,
    NotificationService,
    UserInterestService,
    UserPermissionService,
    UserFilterHelper,
    UserDisagreeService,
    OrderService,
    UserFollowService,
    UserBlockService,
    UserViewService,
    UserLocationService,
    UserAnonymousService,
    UserAnonymousSessionService,
    QueueService,
    EventHookWorkerService,
    EventHookNotificationService,
    ChatRoomUserOptionService,
    HttpClientService,
    HttpConfig,
  ],
  exports: [
    UserFilterHelper,
    UserAnonymousService,
    UserAnonymousSessionService,
    UserBlockService,
    UserDisagreeService,
    UserFollowService,
    UserInterestService,
    UserLocationService,
    UserMoodService,
    UserQuestionService,
    UserSessionService,
    UserViewService,
    UserService,
  ],
})
export class UserModule {}
