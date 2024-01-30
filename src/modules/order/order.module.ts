import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationService } from "../notification/services/notification.service";
import { HandleService, HandleServiceSchema } from "../plan/schemas/handle_service.schema";
import { Plan, PlanSchema } from "../plan/schemas/plan.schema";
import { HandleServiceService } from "../plan/services/handle_service.service";
import { PlanService } from "../plan/services/plan.service";
import { Purchase, PurchaseSchema } from "../purchase/schemas/purchase.schema";
import { PurchaseService } from "../purchase/services/purchase.service";
import { QueueService } from "../queue/queue.service";
import { Subscribe, SubscribeSchema } from "../subscribe/schemas/subscribe.schema";
import { SubscribeService } from "../subscribe/services/subscribe.service";
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
import { OrderController } from "./controllers/order.controller";
// import { OrderHelper } from "./helper/OrderHelper";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { Course, CourseSchema } from "../course/schemas/course.schema";
import { CourseOneOne, CourseOneOneSchema } from "../course/schemas/course_one_one.schema";
import { CourseUser, CourseUserSchema } from "../course/schemas/course_user.schema";
import { CourseService } from "../course/services/course.service";
import { CourseUserService } from "../course/services/course_user.service";
import { EmailModule } from "../email/email.module";
import { UserModule } from "../user/user.module";
import { OrderHelper } from "./helper/order.helper";
import { Order, OrderSchema } from "./schemas/order.schema";
import { VnpayLog, VnpayLogSchema } from "./schemas/vnpay_log.schema";
import { OrderService } from "./services/order.service";

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
      { name: Order.name, schema: OrderSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: HandleService.name, schema: HandleServiceSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: VnpayLog.name, schema: VnpayLogSchema },
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: CourseUser.name, schema: CourseUserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: CourseOneOne.name, schema: CourseOneOneSchema },
    ]),
    EmailModule,
    UserModule,
  ],
  controllers: [OrderController],
  providers: [
    TransactionService,
    HandleServiceService,
    PlanService,
    SubscribeService,
    OrderService,
    PurchaseService,
    UserPermissionService,
    UserSessionService,
    QueueService,
    UserService,
    EventHookWorkerService,
    EventHookNotificationService,
    NotificationHelper,
    NotificationService,
    TransactionHelper,
    TransactionBankService,
    JwtHelperService,
    OrderHelper,
    CourseUserService,
    CourseService,
    UserService,
  ],
  exports: [OrderService],
})
export class OrderModule {}
