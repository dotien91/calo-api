import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { NotificationModule } from "../notification/notification.module";
import { QueueService } from "../queue/queue.service";
import { Referral, ReferralSchema } from "../referral/schemas/referral.schema";
import { ReferralService } from "../referral/services/referral.service";
import { SocketModule } from "../socket/socket.module";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionBank } from "../transaction/schemas/transaction_bank.schema";
import { TransactionService } from "../transaction/services/transaction.service";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserPointHistory, UserPointHistorySchema } from "../user/schemas/user_point_history.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserService } from "../user/services/user.service";
import { UserPointHistoryService } from "../user/services/user_point_history.service";
import { UserSessionService } from "../user/services/user_session.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { EventHookAdderService } from "./services/hook_add.service";
import { EventHookWorkerService } from "./services/hook_do.service";
import { EventHookNotificationService } from "./services/hook_notification.service";

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
      { name: UserPointHistory.name, schema: UserPointHistorySchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: TransactionBank.name, schema: TransactionSchema },
      { name: Referral.name, schema: ReferralSchema },
    ]),
    SocketModule,
    NotificationModule,
  ],
  providers: [
    EventHookNotificationService,
    EventHookWorkerService,
    EventHookAdderService,
    UserService,
    UserSessionService,
    TransactionHelper,
    UserPermissionService,
    JwtHelperService,
    QueueService,
    TransactionService,
    TransactionBankService,
    UserPointHistoryService,
    ReferralService,
  ],
  exports: [EventHookNotificationService, EventHookWorkerService, EventHookAdderService],
})
export class HookModule {}
