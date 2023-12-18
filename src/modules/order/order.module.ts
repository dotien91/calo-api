import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderService } from "./services/order.service";
import { Order, OrderSchema } from "./schemas/order.schema";
import { Plan, PlanSchema } from "../plan/schemas/plan.schema";
import { PlanService } from "../plan/services/plan.service";
import { OrderHelper } from "./helper/OrderHelper";
import { OrderController } from "./controllers/order.controller";
import { SubscribeService } from "../subscribe/services/subscribe.service";
import { Subscribe, SubscribeSchema } from "../subscribe/schemas/subscribe.schema";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { Purchase, PurchaseSchema } from "../purchase/schemas/purchase.schema";
import { PurchaseService } from "../purchase/services/purchase.service";
import { ChatSocketService } from "../chat_socket/chat_socket.service";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { UserSessionService } from "../user/services/user_session.service";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { Channel, ChannelSchema } from "../channel/schemas/channel.schema";
import { ChannelService } from "../channel/services/channel.service";
import { HandleService, HandleServiceSchema } from "../plan/schemas/handle_service.schema";
import { HandleServiceService } from "../plan/services/handle_service.service";
import { Course, CourseSchema } from "../course/schemas/course.schema";
import { CourseLike, CourseLikeSchema } from "../course/schemas/course_like.schema";
import { CourseService } from "../course/services/course.service";
import { CourseLikeService } from "../course/services/course_like.service";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionService } from "../transaction/services/transaction.service";
import { ChannelPermissionService } from "../channel/services/channel_permission.service";
import { ChannelPermission, ChannelPermissionSchema } from "../channel/schemas/channel_permission.schema";
import { ChannelLevel, ChannelLevelSchema } from "../channel/schemas/channel_level.schema";
import { ChannelLevelService } from "../channel/services/channel_level.service";
import { ChannelPointHistory, ChannelPointHistorySchema } from "../channel/schemas/channel_point_history.schema";
import { VnpayLog, VnpayLogSchema } from "./schemas/vnpay_log.schema";
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
import { UserService } from "../user/services/user.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { ChallengeService } from "../challenge/services/challenge.service";
import { Challenge, ChallengeSchema } from "../challenge/schemas/challenge.schema";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { Ticket, TicketSchema } from "../ticket/schemas/ticket.schema";
import { TicketService } from "../ticket/services/ticket.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { NotificationService } from "../notification/services/notification.service";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { Redeem, RedeemSchema } from "../redeem/schemas/redeem.schema";
import { TransactionModule } from "../transaction/transaction.module";
import { RedeemMission, RedeemMissionSchema } from "../redeem/schemas/redeem_mission.schema";
import { GiftHelper } from "../gift/helper/gift.helper";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { UserOptionService } from "../user/services/user_option.service";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { ChatRoomService } from "../chat_room/services/chat_room.service";
import { TransactionBank, TransactionBankSchema } from "../transaction/schemas/transaction_bank.schema";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { ChatHistory, ChatHistorySchema } from "../chat_history/schemas/chat_history.schema";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";

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
      { name: Order.name, schema: OrderSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: HandleService.name, schema: HandleServiceSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: Course.name, schema: CourseSchema },
      { name: CourseLike.name, schema: CourseLikeSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema },
      { name: ChannelLevel.name, schema: ChannelLevelSchema },
      { name: ChannelPointHistory.name, schema: ChannelPointHistorySchema },
      { name: VnpayLog.name, schema: VnpayLogSchema },
      { name: RedeemPermission.name, schema: RedeemPermissionSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: UserGift.name, schema: UserGiftSchema },
      { name: ChallengePermission.name, schema: ChallengePermissionSchema },
      { name: ChallengeActivity.name, schema: ChallengeActivitySchema },
      { name: User.name, schema: UserSchema },
      { name: Challenge.name, schema: ChallengeSchema },
      { name: Ticket.name, schema: TicketSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Redeem.name, schema: RedeemSchema },
      { name: RedeemMission.name, schema: RedeemMissionSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [
    TicketService,
    ChannelLevelService,
    ChannelPermissionService,
    CourseService,
    TransactionService,
    CourseLikeService,
    HandleServiceService,
    ChannelService,
    PlanService,
    SubscribeService,
    OrderService,
    PurchaseService,
    OrderHelper,
    UserPermissionService,
    ChatSocketService,
    JwtHelperService,
    UserSessionService,
    QueueService,
    GiftService,
    UserGiftService,
    ChallengePermissionService,
    ChallengeActivityService,
    UserService,
    ChallengeService,
    EventHookWorkerService,
    EventHookNotificationService,
    NotificationHelper,
    NotificationService,
    GiftHelper,
    TransactionHelper,
    ChatMediaService,
    ChatHistoryHelper,
    TransactionBankService,
    UserOptionService,
    ChatHistoryService,
    ChatRoomUserOptionService,
    ChatRoomService,
  ],
  exports: [OrderHelper, OrderService],
})
export class OrderModule { }
