import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CityService } from "./services/city.service";
import { City, CitySchema } from "./schemas/city.schema";
import { CityHelper } from "./helper/city.helper";
import { CityController } from "./controllers/city.controller";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserService } from "../user/services/user.service";
import { UserJoinCity, UserJoinCitySchema } from "./schemas/user_join_city.schema";
import { UserJoinCityService } from "./services/user_join_city.service";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserOptionService } from "../user/services/user_option.service";
import { UserFilterHelper } from "../user/helper/user_filter.helper";
import { UserFollow, UserFollowSchema } from "../user/schemas/user_follow.schema";
import { UserFollowService } from "../user/services/user_follow.service";
import { UserView, UserViewSchema } from "../user/schemas/user_view.schema";
import { UserViewService } from "../user/services/user_view.service";
import { Order, OrderSchema } from "../order/schemas/order.schema";
import { OrderService } from "../order/services/order.service";
import { UserDisagree, UserDisagreeSchema } from "../user/schemas/user_disagree.schema";
import { UserDisagreeService } from "../user/services/user_disagree.service";
import { UserBlock, UserBlockSchema } from "../user/schemas/user_block.schema";
import { UserBlockService } from "../user/services/user_block.service";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";
import { ChatRoomService } from "../chat_room/services/chat_room.service";
import { ChatRoomHelper } from "../chat_room/helpers/chat_room.helper";
import { ChatHistory, ChatHistorySchema } from "../chat_history/schemas/chat_history.schema";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { NotificationService } from "../notification/services/notification.service";
import { UserMood, UserMoodSchema } from "../user/schemas/user_mood.schema";
import { UserMoodService } from "../user/services/user_mood.service";
import { Short, ShortSchema } from "../short/schemas/short.schema";
import { ShortService } from "../short/services/short.service";
import { UserQuestion, UserQuestionSchema } from "../user/schemas/user_question.schema";
import { UserQuestionService } from "../user/services/user_question.service";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { TransactionService } from "../transaction/services/transaction.service";
import { Topic, TopicSchema } from "../topic/schemas/topic.schema";
import { TopicJoin, TopicJoinSchema } from "../topic/schemas/topic_join.schema";
import { TopicService } from "../topic/services/topic.service";
import { TopicJoinService } from "../topic/services/topic_join.service";
import { UserLocationHistory, UserLocationHistorySchema } from "../user/schemas/user_location_history.schema";
import { UserLocationService } from "../user/services/user_location.service";
import { UserAnonymous, UserAnonymousSchema } from "../user/schemas/user_anonymous.schema";
import { UserAnonymousService } from "../user/services/user_anonymous.service";
import { Request, RequestSchema } from "../request/schemas/request.schema";
import { RequestService } from "../request/services/request.service";
import { ChannelPermission, ChannelPermissionSchema } from "../channel/schemas/channel_permission.schema";
import { ChannelPermissionService } from "../channel/services/channel_permission.service";
import { ChannelLevel, ChannelLevelSchema } from "../channel/schemas/channel_level.schema";
import { ChannelLevelService } from "../channel/services/channel_level.service";
import { Channel, ChannelSchema } from "../channel/schemas/channel.schema";
import { ChannelPointHistory, ChannelPointHistorySchema } from "../channel/schemas/channel_point_history.schema";
import { TransactionBank, TransactionBankSchema } from "../transaction/schemas/transaction_bank.schema";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { VnpayLog, VnpayLogSchema } from "../order/schemas/vnpay_log.schema";
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
import { ChallengeService } from "../challenge/services/challenge.service";
import { Challenge, ChallengeSchema } from "../challenge/schemas/challenge.schema";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { ChannelService } from "../channel/services/channel.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { Redeem, RedeemSchema } from "../redeem/schemas/redeem.schema";
import { TransactionModule } from "../transaction/transaction.module";
import { RedeemMission, RedeemMissionSchema } from "../redeem/schemas/redeem_mission.schema";
import { GiftModule } from "../gift/gift.module";
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
      { name: City.name, schema: CitySchema },
      { name: User.name, schema: UserSchema },
      { name: UserJoinCity.name, schema: UserJoinCitySchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: UserView.name, schema: UserViewSchema },
      { name: Order.name, schema: OrderSchema },
      { name: UserDisagree.name, schema: UserDisagreeSchema },
      { name: UserBlock.name, schema: UserBlockSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: UserMood.name, schema: UserMoodSchema },
      { name: Redeem.name, schema: RedeemSchema },
      { name: Short.name, schema: ShortSchema },
      { name: UserQuestion.name, schema: UserQuestionSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Topic.name, schema: TopicSchema },
      { name: TopicJoin.name, schema: TopicJoinSchema },
      { name: UserLocationHistory.name, schema: UserLocationHistorySchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: Request.name, schema: RequestSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema },
      { name: ChannelLevel.name, schema: ChannelLevelSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: ChannelPointHistory.name, schema: ChannelPointHistorySchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: VnpayLog.name, schema: VnpayLogSchema },
      { name: RedeemPermission.name, schema: RedeemPermissionSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: UserGift.name, schema: UserGiftSchema },
      { name: ChallengePermission.name, schema: ChallengePermissionSchema },
      { name: ChallengeActivity.name, schema: ChallengeActivitySchema },
      { name: Challenge.name, schema: ChallengeSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema },
      { name: RedeemMission.name, schema: RedeemMissionSchema },
    ]),
  ],
  controllers: [CityController],
  providers: [
    ChannelPermissionService,
    TransactionBankService,
    ChannelLevelService,
    UserFilterHelper,
    RequestService,
    UserMoodService,
    TopicService,
    TopicJoinService,
    UserViewService,
    TransactionHelper,
    TransactionService,
    UserQuestionService,
    ShortService,
    JwtHelperService,
    UserFollowService,
    NotificationHelper,
    UserSessionService,
    CityService,
    CityHelper,
    NotificationService,
    UserService,
    ChatHistoryService,
    ChatHistoryHelper,
    ChatRoomUserOptionService,
    OrderService,
    ChatRoomHelper,
    ChatRoomService,
    ChatMediaService,
    UserBlockService,
    UserPermissionService,
    UserJoinCityService,
    UserOptionService,
    UserDisagreeService,
    UserLocationService,
    UserAnonymousService,
    QueueService,
    GiftService,
    UserGiftService,
    ChallengePermissionService,
    ChallengeActivityService,
    ChallengeService,
    EventHookWorkerService,
    ChannelService,
    EventHookNotificationService,
    GiftHelper,
  ],
  exports: [CityHelper, CityService, UserJoinCityService],
})
export class CityModule { }
