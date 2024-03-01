import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { CouponModule } from "../coupon/coupon.module";
import { EmailModule } from "../email/email.module";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationService } from "../notification/services/notification.service";
import { Order, OrderSchema } from "../order/schemas/order.schema";
import { VnpayLog, VnpayLogSchema } from "../order/schemas/vnpay_log.schema";
import { OrderService } from "../order/services/order.service";
import { HandleService, HandleServiceSchema } from "../plan/schemas/handle_service.schema";
import { Plan, PlanSchema } from "../plan/schemas/plan.schema";
import { HandleServiceService } from "../plan/services/handle_service.service";
import { PlanService } from "../plan/services/plan.service";
import { QueueService } from "../queue/queue.service";
import { SocketModule } from "../socket/socket.module";
import { Subscribe, SubscribeSchema } from "../subscribe/schemas/subscribe.schema";
import { SubscribeService } from "../subscribe/services/subscribe.service";
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
import { PurchaseController } from "./controllers/purchase.controller";
import { PurchaseHelper } from "./helper/purchase.helper";
import { Purchase, PurchaseSchema } from "./schemas/purchase.schema";
import { PurchaseService } from "./services/purchase.service";
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
      { name: Subscribe.name, schema: SubscribeSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: Order.name, schema: OrderSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: HandleService.name, schema: HandleServiceSchema },
      { name: VnpayLog.name, schema: VnpayLogSchema },
      { name: UserPointHistory.name, schema: UserPointHistorySchema },
    ]),
    EmailModule,
    CouponModule,
    SocketModule,
  ],
  controllers: [PurchaseController],
  providers: [
    HandleServiceService,
    TransactionBankService,
    PlanService,
    SubscribeService,
    NotificationService,
    NotificationHelper,
    TransactionHelper,
    UserService,
    JwtHelperService,
    UserSessionService,
    PurchaseService,
    OrderService,
    PurchaseHelper,
    UserPermissionService,
    TransactionService,
    UserFollowService,
    UserAnonymousService,
    QueueService,
    EventHookWorkerService,
    EventHookNotificationService,
    UserPointHistoryService,
  ],
  exports: [PurchaseHelper, PurchaseService],
})
export class PurchaseModule {}
