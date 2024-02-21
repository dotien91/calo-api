import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { NotificationModule } from "../notification/notification.module";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { TransactionModule } from "../transaction/transaction.module";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserService } from "../user/services/user.service";
import { UserSessionService } from "../user/services/user_session.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { Referral, ReferralSchema } from "./schemas/referral.schema";
import { ReferralService } from "./services/referral.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Referral.name, schema: ReferralSchema },
      { name: User.name, schema: UserSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: UserSession.name, schema: UserSessionSchema },
    ]),
    TransactionModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [
    ReferralService,
    UserService,
    TransactionHelper,
    JwtHelperService,
    EventHookWorkerService,
    EventHookNotificationService,
    UserPermissionService,
    UserSessionService,
  ],
  exports: [ReferralService],
})
export class ReferralModule {}

