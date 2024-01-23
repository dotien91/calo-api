import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtHelperService } from "../core/services/jwt_helper.service";
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
import { CourseController } from "./controllers/course.controller";
import { CourseHelper } from "./helper/course.helper";
import { Course, CourseSchema } from "./schemas/course.schema";
import { CourseCalendar, CourseCalendarSchema } from "./schemas/course_calendar.schema";
import { CourseClass, CourseClassSchema } from "./schemas/course_class.schema";
import { CourseModuleSchema } from "./schemas/course_module.schema";
import { CourseReview, CourseReviewSchema } from "./schemas/course_review.schema";
import { CourseUser, CourseUserSchema } from "./schemas/course_user.schema";
import { CourseView, CourseViewSchema } from "./schemas/course_view.schema";
import { CourseService } from "./services/course.service";
import { CourseCalendarService } from "./services/course_calendar.service";
import { CourseClassService } from "./services/course_class.service";
import { CourseModuleService } from "./services/course_module.service";
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
      { name: UserSession.name, schema: UserSessionSchema },
      { name: CourseModule.name, schema: CourseModuleSchema },
      { name: HandleService.name, schema: HandleServiceSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
    ]),
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
  ],
  exports: [
    CourseHelper,
    CourseUserService,
    CourseViewService,
    CourseService,
    CourseReviewService,
    CourseCalendarService,
    CourseClassService,
  ],
})
export class CourseModule {}
