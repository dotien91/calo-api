import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationService } from "../notification/services/notification.service";
import { QueueService } from "../queue/queue.service";
import { SocketModule } from "../socket/socket.module";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserPointHistory, UserPointHistorySchema } from "../user/schemas/user_point_history.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserService } from "../user/services/user.service";
import { UserPointHistoryService } from "../user/services/user_point_history.service";
import { UserSessionService } from "../user/services/user_session.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { TransactionController } from "./controllers/transaction.controller";
import { TransactionHelper } from "./helper/transaction.helper";
import { Transaction, TransactionSchema } from "./schemas/transaction.schema";
import { TransactionBank, TransactionBankSchema } from "./schemas/transaction_bank.schema";
import { TransactionService } from "./services/transaction.service";
import { TransactionBankService } from "./services/transaction_bank.service";
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
      { name: Transaction.name, schema: TransactionSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: User.name, schema: UserSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: UserPointHistory.name, schema: UserPointHistorySchema },
    ]),
    SocketModule,
  ],
  controllers: [TransactionController],
  providers: [
    TransactionBankService,
    TransactionService,
    TransactionHelper,
    UserPermissionService,
    UserService,
    QueueService,
    EventHookWorkerService,
    EventHookNotificationService,
    NotificationHelper,
    JwtHelperService,
    NotificationService,
    UserSessionService,
    UserPointHistoryService,
  ],
  exports: [TransactionHelper, TransactionBankService, TransactionService],
})
export class TransactionModule {}
