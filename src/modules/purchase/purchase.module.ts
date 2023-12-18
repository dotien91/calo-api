import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PurchaseService } from "./services/purchase.service";
import { Purchase, PurchaseSchema } from "./schemas/purchase.schema";
import { Plan, PlanSchema } from "../plan/schemas/plan.schema";
import { PlanService } from "../plan/services/plan.service";
import { PurchaseHelper } from "./helper/purchase.helper";
import { PurchaseController } from "./controllers/purchase.controller";
import { SubscribeService } from "../subscribe/services/subscribe.service";
import { Subscribe, SubscribeSchema } from "../subscribe/schemas/subscribe.schema";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { Order, OrderSchema } from "../order/schemas/order.schema";
import { OrderService } from "../order/services/order.service";
import { OrderHelper } from "../order/helper/OrderHelper";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { UserSessionService } from "../user/services/user_session.service";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserService } from "../user/services/user.service";
import { ChatRoomHelper } from "../chat_room/helpers/chat_room.helper";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { ChatRoomService } from "../chat_room/services/chat_room.service";
import { ChatHistory, ChatHistorySchema } from "../chat_history/schemas/chat_history.schema";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationService } from "../notification/services/notification.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { TransactionService } from "../transaction/services/transaction.service";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserOptionService } from "../user/services/user_option.service";
import { Topic, TopicSchema } from "../topic/schemas/topic.schema";
import { TopicJoin, TopicJoinSchema } from "../topic/schemas/topic_join.schema";
import { TopicService } from "../topic/services/topic.service";
import { TopicJoinService } from "../topic/services/topic_join.service";
import { UserFollow, UserFollowSchema } from "../user/schemas/user_follow.schema";
import { UserFollowService } from "../user/services/user_follow.service";
import { ChatSocketService } from "../chat_socket/chat_socket.service";
import { UserAnonymous, UserAnonymousSchema } from "../user/schemas/user_anonymous.schema";
import { UserAnonymousService } from "../user/services/user_anonymous.service";
import { ChannelPermission, ChannelPermissionSchema } from "../channel/schemas/channel_permission.schema";
import { ChannelLevel, ChannelLevelSchema } from "../channel/schemas/channel_level.schema";
import { ChannelPermissionService } from "../channel/services/channel_permission.service";
import { Channel, ChannelSchema } from "../channel/schemas/channel.schema";
import { ChannelPointHistory, ChannelPointHistorySchema } from "../channel/schemas/channel_point_history.schema";
import { TransactionBank, TransactionBankSchema } from "../transaction/schemas/transaction_bank.schema";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { ChannelService } from "../channel/services/channel.service";
import { HandleService, HandleServiceSchema } from "../plan/schemas/handle_service.schema";
import { HandleServiceService } from "../plan/services/handle_service.service";
import { Course, CourseSchema } from "../course/schemas/course.schema";
import { CourseLike, CourseLikeSchema } from "../course/schemas/course_like.schema";
import { CourseService } from "../course/services/course.service";
import { CourseLikeService } from "../course/services/course_like.service";
import { VnpayLog, VnpayLogSchema } from "../order/schemas/vnpay_log.schema";
import { RedeemPermission, RedeemPermissionSchema } from "../redeem/schemas/redeem_permission.schema";
import { QueueService } from "../queue/queue.service";
import { BullModule } from "@nestjs/bull";
import { Gift, GiftSchema } from "../gift/schemas/gift.schema";
import { UserGift, UserGiftSchema } from "../gift/schemas/user_gift.schema";
import { GiftService } from "../gift/services/gift.service";
import { UserGiftService } from "../gift/services/user_gift.service";
import { ChallengePermissionService } from "../challenge/services/challenge_permission.service";
import { ChallengePermission, ChallengePermissionSchema } from "../challenge/schemas/challenge_permission.schema";
import { ChallengeActivity, ChallengeActivitySchema } from "../challenge/schemas/challenge_activity.schema";
import { ChallengeActivityService } from "../challenge/services/challenge_activity.service";
import { ChallengeService } from "../challenge/services/challenge.service";
import { Challenge, ChallengeSchema } from "../challenge/schemas/challenge.schema";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { Ticket, TicketSchema } from "../ticket/schemas/ticket.schema";
import { TicketService } from "../ticket/services/ticket.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { Redeem, RedeemSchema } from "../redeem/schemas/redeem.schema";
import { TransactionModule } from "../transaction/transaction.module";
import { RedeemMission, RedeemMissionSchema } from "../redeem/schemas/redeem_mission.schema";
import { GiftHelper } from "../gift/helper/gift.helper";

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
      { name: Subscribe.name, schema: SubscribeSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: Order.name, schema: OrderSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: User.name, schema: UserSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: Topic.name, schema: TopicSchema },
      { name: TopicJoin.name, schema: TopicJoinSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema },
      { name: ChannelLevel.name, schema: ChannelLevelSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: ChannelPointHistory.name, schema: ChannelPointHistorySchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: HandleService.name, schema: HandleServiceSchema },
      { name: Course.name, schema: CourseSchema },
      { name: CourseLike.name, schema: CourseLikeSchema },
      { name: VnpayLog.name, schema: VnpayLogSchema },
      { name: RedeemPermission.name, schema: RedeemPermissionSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: UserGift.name, schema: UserGiftSchema },
      { name: ChallengePermission.name, schema: ChallengePermissionSchema },
      { name: ChallengeActivity.name, schema: ChallengeActivitySchema },
      { name: Challenge.name, schema: ChallengeSchema },
      { name: Ticket.name, schema: TicketSchema },
      { name: Redeem.name, schema: RedeemSchema },
      { name: RedeemMission.name, schema: RedeemMissionSchema },
    ]),
  ],
  controllers: [PurchaseController],
  providers: [
    TicketService,
    CourseService,
    CourseLikeService,
    ChannelService,
    HandleServiceService,
    ChannelPermissionService,
    TransactionBankService,
    PlanService,
    SubscribeService,
    TopicService,
    TopicJoinService,
    ChatRoomUserOptionService,
    NotificationService,
    NotificationHelper,
    TransactionHelper,
    ChatRoomHelper,
    UserOptionService,
    ChatRoomService,
    UserService,
    JwtHelperService,
    UserSessionService,
    OrderHelper,
    PurchaseService,
    OrderService,
    ChatHistoryHelper,
    PurchaseHelper,
    UserPermissionService,
    ChatHistoryService,
    ChatMediaService,
    TransactionService,
    UserFollowService,
    ChatSocketService,
    UserAnonymousService,
    QueueService,
    GiftService,
    UserGiftService,
    ChallengePermissionService,
    ChallengeActivityService,
    ChallengeService,
    EventHookWorkerService,
    EventHookNotificationService,
    GiftHelper,
  ],
  exports: [PurchaseHelper, PurchaseService],
})
export class PurchaseModule { }
