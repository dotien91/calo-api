import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CourseService } from "./services/course.service";
import { Course, CourseSchema } from "./schemas/course.schema";
import { CourseHelper } from "./helper/course.helper";
import { CourseController } from "./controllers/course.controller";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { CourseLike, CourseLikeSchema } from "./schemas/course_like.schema";
import { CourseView, CourseViewSchema } from "./schemas/course_view.schema";
import { CourseViewService } from "./services/course_view.service";
import { CourseLikeService } from "./services/course_like.service";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserOptionService } from "../user/services/user_option.service";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";
import { CourseModuleSchema } from "./schemas/course_module.schema";
import { CourseModuleService } from "./services/course_module.service";
import { ChannelPermission, ChannelPermissionSchema } from "../channel/schemas/channel_permission.schema";
import { ChannelLevel, ChannelLevelSchema } from "../channel/schemas/channel_level.schema";
import { Channel } from "diagnostics_channel";
import { ChannelSchema } from "../channel/schemas/channel.schema";
import { ChannelPermissionService } from "../channel/services/channel_permission.service";
import { ChannelPointHistory, ChannelPointHistorySchema } from "../channel/schemas/channel_point_history.schema";
import { HandleService, HandleServiceSchema } from "../plan/schemas/handle_service.schema";
import { HandleServiceService } from "../plan/services/handle_service.service";
import { Plan, PlanSchema } from "../plan/schemas/plan.schema";
import { PlanService } from "../plan/services/plan.service";
import { RedeemPermission, RedeemPermissionSchema } from "../redeem/schemas/redeem_permission.schema";
import { BullModule } from "@nestjs/bull";
import { QueueService } from "../queue/queue.service";
import { GiftService } from "../gift/services/gift.service";
import { UserGiftService } from "../gift/services/user_gift.service";
import { Gift, GiftSchema } from "../gift/schemas/gift.schema";
import { UserGift, UserGiftSchema } from "../gift/schemas/user_gift.schema";
import { ChallengePermission, ChallengePermissionSchema } from "../challenge/schemas/challenge_permission.schema";
import { ChallengePermissionService } from "../challenge/services/challenge_permission.service";
import { UserService } from "../user/services/user.service";
import { ChallengeActivityService } from "../challenge/services/challenge_activity.service";
import { ChallengeActivity, ChallengeActivitySchema } from "../challenge/schemas/challenge_activity.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { Challenge, ChallengeSchema } from "../challenge/schemas/challenge.schema";
import { ChallengeService } from "../challenge/services/challenge.service";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { ChannelService } from "../channel/services/channel.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { NotificationService } from "../notification/services/notification.service";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { Redeem, RedeemSchema } from "../redeem/schemas/redeem.schema";
import { TransactionModule } from "../transaction/transaction.module";
import { RedeemMission, RedeemMissionSchema } from "../redeem/schemas/redeem_mission.schema";
import { GiftModule } from "../gift/gift.module";
import { GiftHelper } from "../gift/helper/gift.helper";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { TransactionService } from "../transaction/services/transaction.service";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { ChatRoomService } from "../chat_room/services/chat_room.service";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionBank, TransactionBankSchema } from "../transaction/schemas/transaction_bank.schema";
import { ChatHistory, ChatHistorySchema } from "../chat_history/schemas/chat_history.schema";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";

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
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: CourseLike.name, schema: CourseLikeSchema },
      { name: CourseView.name, schema: CourseViewSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: CourseModule.name, schema: CourseModuleSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema },
      { name: ChannelLevel.name, schema: ChannelLevelSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: ChannelPointHistory.name, schema: ChannelPointHistorySchema },
      { name: HandleService.name, schema: HandleServiceSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: RedeemPermission.name, schema: RedeemPermissionSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: UserGift.name, schema: UserGiftSchema },
      { name: ChallengePermission.name, schema: ChallengePermissionSchema },
      { name: ChallengeActivity.name, schema: ChallengeActivitySchema },
      { name: User.name, schema: UserSchema },
      { name: Challenge.name, schema: ChallengeSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Redeem.name, schema: RedeemSchema },
      { name: RedeemMission.name, schema: RedeemMissionSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
  ],
  controllers: [CourseController],
  providers: [
    PlanService,
    HandleServiceService,
    ChannelPermissionService,
    CourseService,
    CourseHelper,
    CourseViewService,
    UserOptionService,
    CourseLikeService,
    UserSessionService,
    UserPermissionService,
    ChatMediaService,
    CourseModuleService,
    QueueService,
    GiftService,
    UserGiftService,
    ChallengePermissionService,
    UserService,
    ChallengeActivityService,
    ChallengeService,
    EventHookWorkerService,
    ChannelService,
    EventHookNotificationService,
    NotificationHelper,
    NotificationService,
    JwtHelperService,
    GiftHelper,
    TransactionHelper,
    ChatHistoryHelper,
    TransactionService,
    TransactionBankService,
    ChatHistoryService,
    ChatRoomUserOptionService,
    ChatRoomService,
  ],
  exports: [CourseHelper, CourseLikeService, CourseViewService, CourseService],
})
export class CourseModule {}
