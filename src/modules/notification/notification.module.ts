import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { I18NModule } from "../i18n/i18n.module";
import { SocketModule } from "../socket/socket.module";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserService } from "../user/services/user.service";
import { UserSessionService } from "../user/services/user_session.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { NotificationController } from "./controllers/notification.controller";
import { NotificationHelper } from "./helper/notification.helper";
import { Notification, NotificationSchema } from "./schemas/notification.schema";
import { NotificationService } from "./services/notification.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    SocketModule,
    I18NModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationHelper,
    UserPermissionService,
    UserSessionService,
    JwtHelperService,
    UserService,
    EventHookNotificationService,
  ],
  exports: [NotificationHelper, NotificationService],
})
export class NotificationModule {}
