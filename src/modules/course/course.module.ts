import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ChatRoomModule } from "../chat_room/chat_room.module";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { CouponModule } from "../coupon/coupon.module";
import { EmailModule } from "../email/email.module";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationService } from "../notification/services/notification.service";
import { HandleService, HandleServiceSchema } from "../plan/schemas/handle_service.schema";
import { Plan, PlanSchema } from "../plan/schemas/plan.schema";
import { HandleServiceService } from "../plan/services/handle_service.service";
import { PlanService } from "../plan/services/plan.service";
import { QueueService } from "../queue/queue.service";
import { RedeemModule } from "../redeem/redeem.module";
import { ReferralModule } from "../referral/referral.module";
import { SocketModule } from "../socket/socket.module";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionBank, TransactionBankSchema } from "../transaction/schemas/transaction_bank.schema";
import { TransactionService } from "../transaction/services/transaction.service";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserOrganization, UserOrganizationSchema } from "../user/schemas/user_organization.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserService } from "../user/services/user.service";
import { UserOrganizationService } from "../user/services/user_organization.service";
import { UserSessionService } from "../user/services/user_session.service";
import { UserModule } from "../user/user.module";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { CourseController } from "./controllers/course.controller";
import { CourseHelper } from "./helper/course.helper";
import { Course, CourseSchema } from "./schemas/course.schema";
import { CourseCalendar, CourseCalendarSchema } from "./schemas/course_calendar.schema";
import { CourseClass, CourseClassSchema } from "./schemas/course_class.schema";
import { CourseModuleSchema } from "./schemas/course_module.schema";
import { CourseOneOne, CourseOneOneSchema } from "./schemas/course_one_one.schema";
import { CourseReview, CourseReviewSchema } from "./schemas/course_review.schema";
import { CourseUser, CourseUserSchema } from "./schemas/course_user.schema";
import { CourseView, CourseViewSchema } from "./schemas/course_view.schema";
import { CourseService } from "./services/course.service";
import { CourseCalendarService } from "./services/course_calendar.service";
import { CourseClassService } from "./services/course_class.service";
import { CourseModuleService } from "./services/course_module.service";
import { CourseOneOneService } from "./services/course_one_one.service";
import { CourseReviewService } from "./services/course_review.service";
import { CourseUserService } from "./services/course_user.service";
import { CourseViewService } from "./services/course_view.service";

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
      { name: Course.name, schema: CourseSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: CourseUser.name, schema: CourseUserSchema },
      { name: CourseView.name, schema: CourseViewSchema },
      { name: CourseReview.name, schema: CourseReviewSchema },
      { name: CourseCalendar.name, schema: CourseCalendarSchema },
      { name: CourseClass.name, schema: CourseClassSchema },
      { name: CourseOneOne.name, schema: CourseOneOneSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: CourseModule.name, schema: CourseModuleSchema },
      { name: HandleService.name, schema: HandleServiceSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: User.name, schema: UserSchema },
      { name: UserOrganization.name, schema: UserOrganizationSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
    ]),
    ChatRoomModule,
    UserModule,
    EmailModule,
    CouponModule,
    ReferralModule,
    RedeemModule,
    SocketModule,
  ],
  controllers: [CourseController],
  providers: [
    PlanService,
    HandleServiceService,
    CourseService,
    CourseHelper,
    CourseViewService,
    CourseUserService,
    CourseReviewService,
    CourseCalendarService,
    CourseClassService,
    CourseOneOneService,
    UserSessionService,
    UserPermissionService,
    CourseModuleService,
    QueueService,
    UserService,
    EventHookWorkerService,
    EventHookNotificationService,
    NotificationHelper,
    NotificationService,
    JwtHelperService,
    TransactionHelper,
    TransactionService,
    TransactionBankService,
    UserOrganizationService,
    ChatRoomUserOptionService,
  ],
  exports: [
    CourseHelper,
    CourseUserService,
    CourseViewService,
    CourseService,
    CourseReviewService,
    CourseCalendarService,
    CourseClassService,
    CourseOneOneService,
  ],
})
export class CourseModule {}
