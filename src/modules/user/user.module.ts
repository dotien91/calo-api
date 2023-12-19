import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserService } from "./services/user.service";
import { UserController } from "./controllers/user.controller";
import { UserSessionService } from "./services/user_session.service";
import { UserLoginHelper } from "./helper/user_login.helper";
import { User, UserSchema } from "./schemas/user.schema";
import { UserSession, UserSessionSchema } from "./schemas/user_session.schema";
import { UpdateUserHelper } from "./helper/update_user.helper";
import { JwtHelperService } from "../../modules/core/services/jwt_helper.service";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { UserFilterHelper } from "./helper/user_filter.helper";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserOption, UserOptionSchema } from "./schemas/user_option.schema";
import { UserOptionService } from "./services/user_option.service";
import { UserFollow, UserFollowSchema } from "./schemas/user_follow.schema";
import { UserFollowService } from "./services/user_follow.service";
import { UserBlockService } from "./services/user_block.service";
import { UserBlock, UserBlockSchema } from "./schemas/user_block.schema";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { UserView, UserViewSchema } from "./schemas/user_view.schema";
import { UserViewService } from "./services/user_view.service";
import { UserDisagree, UserDisagreeSchema } from "./schemas/user_disagree.schema";
import { UserDisagreeService } from "./services/user_disagree.service";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";
import { ChatRoomHelper } from "../chat_room/helpers/chat_room.helper";
import { ChatRoomService } from "../chat_room/services/chat_room.service";
import { ChatHistory, ChatHistorySchema } from "../chat_history/schemas/chat_history.schema";
import { ChatHistoryService } from "../chat_history/services/chat_history.service";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { Order, OrderSchema } from "../order/schemas/order.schema";
import { OrderService } from "../order/services/order.service";
import { City, CitySchema } from "../city/schemas/city.schema";
import { CityService } from "../city/services/city.service";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { NotificationService } from "../notification/services/notification.service";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { UserInterest, UserInterestSchema } from "./schemas/user_interest.schema";
import { UserInterestService } from "./services/user_interest.service";
import { FaceDetection, FaceDetectionSchema } from "../face_detection/schemas/face_detection.schema";
import { FaceDetectionHelper } from "../face_detection/helper/face_detection.helper";
import { FaceDetectionService } from "../face_detection/services/face_detection.service";
import { UserMood, UserMoodSchema } from "./schemas/user_mood.schema";
import { UserMoodService } from "./services/user_mood.service";
import { Short, ShortSchema } from "../short/schemas/short.schema";
import { ShortService } from "../short/services/short.service";
import { UserQuestion, UserQuestionSchema } from "./schemas/user_question.schema";
import { UserQuestionService } from "./services/user_question.service";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionService } from "../transaction/services/transaction.service";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { Config, ConfigSchema } from "../config/schemas/config.schema";
import { ConfigService } from "../config/services/config.service";
import { Topic, TopicSchema } from "../topic/schemas/topic.schema";
import { TopicJoin, TopicJoinSchema } from "../topic/schemas/topic_join.schema";
import { TopicService } from "../topic/services/topic.service";
import { TopicJoinService } from "../topic/services/topic_join.service";
import { UserLocationService } from "./services/user_location.service";
import { UserLocationHistory, UserLocationHistorySchema } from "./schemas/user_location_history.schema";
import { UserAnonymous, UserAnonymousSchema } from "./schemas/user_anonymous.schema";
import { UserAnonymousService } from "./services/user_anonymous.service";
import { UserAnonymousSession, UserAnonymousSessionSchema } from "./schemas/user_anonymous_session.schema";
import { UserAnonymousSessionService } from "./services/user_anonymous_session.service";
import { Request, RequestSchema } from "../request/schemas/request.schema";
import { RequestService } from "../request/services/request.service";
import { ChannelPermission, ChannelPermissionSchema } from "../channel/schemas/channel_permission.schema";
import { ChannelPermissionService } from "../channel/services/channel_permission.service";
import { ChannelLevel, ChannelLevelSchema } from "../channel/schemas/channel_level.schema";
import { Channel, ChannelSchema } from "../channel/schemas/channel.schema";
import { ChannelLevelService } from "../channel/services/channel_level.service";
import { ChannelPointHistory, ChannelPointHistorySchema } from "../channel/schemas/channel_point_history.schema";
import { ChannelService } from "../channel/services/channel.service";
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
import { Challenge, ChallengeSchema } from "../challenge/schemas/challenge.schema";
import { ChallengeService } from "../challenge/services/challenge.service";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { Redeem, RedeemSchema } from "../redeem/schemas/redeem.schema";
import { TransactionModule } from "../transaction/transaction.module";
import { RedeemMission, RedeemMissionSchema } from "../redeem/schemas/redeem_mission.schema";
import { GiftHelper } from "../gift/helper/gift.helper";

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
      { name: UserSession.name, schema: UserSessionSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: UserBlock.name, schema: UserBlockSchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      { name: UserView.name, schema: UserViewSchema },
      { name: UserDisagree.name, schema: UserDisagreeSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: UserInterest.name, schema: UserInterestSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: Order.name, schema: OrderSchema },
      { name: City.name, schema: CitySchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: FaceDetection.name, schema: FaceDetectionSchema },
      { name: UserMood.name, schema: UserMoodSchema },
      { name: Short.name, schema: ShortSchema },
      { name: UserQuestion.name, schema: UserQuestionSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Config.name, schema: ConfigSchema },
      { name: Topic.name, schema: TopicSchema },
      { name: TopicJoin.name, schema: TopicJoinSchema },
      { name: UserLocationHistory.name, schema: UserLocationHistorySchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: UserAnonymousSession.name, schema: UserAnonymousSessionSchema },
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
      { name: Redeem.name, schema: RedeemSchema },
      { name: RedeemMission.name, schema: RedeemMissionSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [
    ChannelService,
    TransactionBankService,
    UserService,
    ConfigService,
    ChannelLevelService,
    ChannelPermissionService,
    UserLoginHelper,
    TransactionService,
    TransactionHelper,
    UpdateUserHelper,
    UserMoodService,
    UserQuestionService,
    ShortService,
    FaceDetectionHelper,
    FaceDetectionService,
    UserSessionService,
    JwtHelperService,
    NotificationHelper,
    NotificationService,
    CityService,
    ChatRoomHelper,
    ChatRoomService,
    ChatHistoryService,
    ChatHistoryHelper,
    UserInterestService,
    ChatMediaService,
    UserPermissionService,
    UserFilterHelper,
    UserDisagreeService,
    UserOptionService,
    OrderService,
    UserFollowService,
    UserBlockService,
    ChatRoomUserOptionService,
    UserViewService,
    TopicService,
    TopicJoinService,
    UserLocationService,
    UserAnonymousService,
    UserAnonymousSessionService,
    RequestService,
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
  exports: [
    UserFilterHelper,
    UserAnonymousService,
    UserAnonymousSessionService,
    UserBlockService,
    UserDisagreeService,
    UserFollowService,
    UserInterestService,
    UserLocationService,
    UserMoodService,
    UserOptionService,
    UserQuestionService,
    UserSessionService,
    UserViewService,
    UserService,
  ],
})
export class UserModule {}
