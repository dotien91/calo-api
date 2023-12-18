import { Module } from "@nestjs/common";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { EventController } from "./controllers/event.controller";
import { EventHelper } from "./helper/event.helper";
import { MongooseModule } from "@nestjs/mongoose";
import { Event, EventSchema } from "./schemas/event.schema";
import { EventService } from "./services/event.service";
import { EventType, EventTypeSchema } from "./schemas/event_type.schema";
import { EventCategory, EventCategorySchema } from "./schemas/event_category.schema";
import { EventReport, EventReportSchema } from "./schemas/event_report.schema";
import { EventRating, EventRatingSchema } from "./schemas/event_rating.schema";
import { EventCategoryService } from "./services/event_category.service";
import { EventRatingService } from "./services/event_rating.service";
import { EventReportService } from "./services/event_report.service";
import { EventTypeService } from "./services/event_type.service";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { EventTypeController } from "./controllers/event_type.controller";
import { EventRatingController } from "./controllers/event_rating.controller";
import { EventTypeHelper } from "./helper/event_type.helper";
import { EventRatingHelper } from "./helper/event_rating.helper";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserService } from "../user/services/user.service";
import { UserFollowEvent, UserFollowEventSchema } from "./schemas/user_follow_event.schema";
import { UserFollowEventService } from "./services/user_follow_event.service";
import { EventIndex, EventIndexSchema } from "./schemas/event_index.schema";
import { EventIndexService } from "./services/event_index.service";
import { ChannelPermission, ChannelPermissionSchema } from "../channel/schemas/channel_permission.schema";
import { ChannelPermissionService } from "../channel/services/channel_permission.service";
import { ChannelLevel, ChannelLevelSchema } from "../channel/schemas/channel_level.schema";
import { Channel, ChannelSchema } from "../channel/schemas/channel.schema";
import { ChannelPointHistory, ChannelPointHistorySchema } from "../channel/schemas/channel_point_history.schema";
import { RedeemPermission, RedeemPermissionSchema } from "../redeem/schemas/redeem_permission.schema";
import { BullModule } from "@nestjs/bull";
import { QueueService } from "../queue/queue.service";
import { GiftService } from "../gift/services/gift.service";
import { UserGiftService } from "../gift/services/user_gift.service";
import { Gift, GiftSchema } from "../gift/schemas/gift.schema";
import { UserGift, UserGiftSchema } from "../gift/schemas/user_gift.schema";
import { ChallengePermission, ChallengePermissionSchema } from "../challenge/schemas/challenge_permission.schema";
import { ChallengePermissionService } from "../challenge/services/challenge_permission.service";
import { ChallengeActivityService } from "../challenge/services/challenge_activity.service";
import { ChallengeActivity, ChallengeActivitySchema } from "../challenge/schemas/challenge_activity.schema";
import { Challenge, ChallengeSchema } from "../challenge/schemas/challenge.schema";
import { ChallengeService } from "../challenge/services/challenge.service";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { ChannelService } from "../channel/services/channel.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { NotificationService } from "../notification/services/notification.service";
import { UserSessionService } from "../user/services/user_session.service";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { Redeem, RedeemSchema } from "../redeem/schemas/redeem.schema";
import { RedeemMission, RedeemMissionSchema } from "../redeem/schemas/redeem_mission.schema";
import { TransactionModule } from "../transaction/transaction.module";
import { GiftModule } from "../gift/gift.module";
import { GiftHelper } from "../gift/helper/gift.helper";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { TransactionService } from "../transaction/services/transaction.service";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { UserOptionService } from "../user/services/user_option.service";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { ChatRoomService } from "../chat_room/services/chat_room.service";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionBank, TransactionBankSchema } from "../transaction/schemas/transaction_bank.schema";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { ChatHistory, ChatHistorySchema } from "../chat_history/schemas/chat_history.schema";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";
import { Course, CourseSchema } from "../course/schemas/course.schema";
import { CourseLike, CourseLikeSchema } from "../course/schemas/course_like.schema";
import { CourseLikeService } from "../course/services/course_like.service";

@Module({
  imports: [
    BullModule.registerQueueAsync(
      {
        name: 'gift'
      },
      {
        name: 'noti'
      },
      {
        name: 'challenge'
      }),
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: EventType.name, schema: EventTypeSchema },
      { name: EventCategory.name, schema: EventCategorySchema },
      { name: EventReport.name, schema: EventReportSchema },
      { name: EventRating.name, schema: EventRatingSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: User.name, schema: UserSchema },
      { name: UserFollowEvent.name, schema: UserFollowEventSchema },
      { name: EventIndex.name, schema: EventIndexSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema },
      { name: ChannelLevel.name, schema: ChannelLevelSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: ChannelPointHistory.name, schema: ChannelPointHistorySchema },
      { name: RedeemPermission.name, schema: RedeemPermissionSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: UserGift.name, schema: UserGiftSchema },
      { name: ChallengePermission.name, schema: ChallengePermissionSchema },
      { name: ChallengeActivity.name, schema: ChallengeActivitySchema },
      { name: Challenge.name, schema: ChallengeSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: Redeem.name, schema: RedeemSchema },
      { name: RedeemMission.name, schema: RedeemMissionSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: Course.name, schema: CourseSchema },
      { name: CourseLike.name, schema: CourseLikeSchema }
    ]),
  ],
  controllers: [EventController, EventTypeController, EventRatingController],
  providers: [
    CourseLikeService,
    ChannelPermissionService,
    EventHelper,
    EventTypeHelper,
    EventRatingHelper,
    EventService,
    UserPermissionService,
    EventCategoryService,
    EventIndexService,
    EventService,
    EventRatingService,
    EventReportService,
    UserFollowEventService,
    UserService,
    EventTypeService,
    QueueService,
    GiftService,
    UserGiftService,
    ChallengePermissionService,
    ChallengeActivityService,
    ChallengeService,
    EventHookWorkerService,
    EventHookNotificationService,
    ChannelService,
    NotificationHelper,
    NotificationService,
    UserSessionService,
    JwtHelperService,
    GiftHelper,
    TransactionHelper,
    ChatMediaService,
    ChatHistoryHelper,
    TransactionService,
    TransactionBankService,
    UserOptionService,
    ChatHistoryService,
    ChatRoomUserOptionService,
    ChatRoomService,
  ],
  exports: [EventHelper, EventCategoryService, EventIndexService, EventRatingService, EventReportService, EventTypeService, EventService, UserFollowEventService],
})
export class EventModule { }
