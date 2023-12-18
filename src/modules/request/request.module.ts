import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RequestService } from "./services/request.service";
import { Request, RequestSchema } from "./schemas/request.schema";
import { RequestHelper } from "./helper/request.helper";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { RequestCategory, RequestCategorySchema } from "./schemas/request-category.schema";
import { RequestCategoryService } from "./services/request_category.service";
import { RequestController } from "./controllers/request.controller";
import { RequestComment, RequestCommentSchema } from "./schemas/request-comment.schema";
import { RequestCommentService } from "./services/request_comment.service";
import { RequestLike, RequestLikeSchema } from "./schemas/request_like.schema";
import { RequestLikeService } from "./services/request_like.service";
import { UserAnonymousSession, UserAnonymousSessionSchema } from "../user/schemas/user_anonymous_session.schema";
import { UserAnonymousSessionService } from "../user/services/user_anonymous_session.service";
import { UserAnonymous, UserAnonymousSchema } from "../user/schemas/user_anonymous.schema";
import { UserAnonymousService } from "../user/services/user_anonymous.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserService } from "../user/services/user.service";
import { RequestDisLike, RequestDisLikeSchema } from "./schemas/request_dislike.schema";
import { RequestDisLikeService } from "./services/request_dislike.service";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationService } from "../notification/services/notification.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserOptionService } from "../user/services/user_option.service";
import { RequestPoll, RequestPollSchema } from "./schemas/request_poll.schema";
import { RequestPollService } from "./services/request_poll.service";
import { ChannelPermission, ChannelPermissionSchema } from "../channel/schemas/channel_permission.schema";
import { ChannelLevel, ChannelLevelSchema } from "../channel/schemas/channel_level.schema";
import { ChannelLevelService } from "../channel/services/channel_level.service";
import { ChannelPermissionService } from "../channel/services/channel_permission.service";
import { UserFollow, UserFollowSchema } from "../user/schemas/user_follow.schema";
import { UserFollowService } from "../user/services/user_follow.service";
import { Channel, ChannelSchema } from "../channel/schemas/channel.schema";
import { ChannelService } from "../channel/services/channel.service";
import { ChannelPointHistory, ChannelPointHistorySchema } from "../channel/schemas/channel_point_history.schema";
import { RedeemPermission, RedeemPermissionSchema } from "../redeem/schemas/redeem_permission.schema";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { QueueService } from "../queue/queue.service";
import { BullModule } from "@nestjs/bull";
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
import { Redeem, RedeemSchema } from "../redeem/schemas/redeem.schema";
import { TransactionModule } from "../transaction/transaction.module";
import { RedeemMission, RedeemMissionSchema } from "../redeem/schemas/redeem_mission.schema";
import { GiftHelper } from "../gift/helper/gift.helper";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { ChatHistoryHelper } from "../chat_history/helpers/chat_history.helper";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { TransactionService } from "../transaction/services/transaction.service";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
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
        name: 'gift'
      },
      {
        name: 'noti'
      },
      {
        name: 'challenge'
      }),
    MongooseModule.forFeature([
      { name: Request.name, schema: RequestSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: RequestCategory.name, schema: RequestCategorySchema },
      { name: RequestComment.name, schema: RequestCommentSchema },
      { name: RequestLike.name, schema: RequestLikeSchema },
      { name: UserAnonymousSession.name, schema: UserAnonymousSessionSchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: User.name, schema: UserSchema },
      { name: RequestDisLike.name, schema: RequestDisLikeSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: RequestPoll.name, schema: RequestPollSchema },
      { name: ChannelPermission.name, schema: ChannelPermissionSchema },
      { name: ChannelLevel.name, schema: ChannelLevelSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: ChannelPointHistory.name, schema: ChannelPointHistorySchema },
      { name: RedeemPermission.name, schema: RedeemPermissionSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: UserGift.name, schema: UserGiftSchema },
      { name: ChallengePermission.name, schema: ChallengePermissionSchema },
      { name: ChallengeActivity.name, schema: ChallengeActivitySchema },
      { name: Challenge.name, schema: ChallengeSchema },
      { name: Redeem.name, schema: RedeemSchema },
      { name: RedeemMission.name, schema: RedeemMissionSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
  ],
  controllers: [RequestController],
  providers: [
    ChannelService,
    RequestDisLikeService,
    UserSessionService,
    NotificationService,
    NotificationHelper,
    RequestService,
    RequestHelper,
    UserPermissionService,
    RequestCategoryService,
    UserAnonymousService,
    RequestCommentService,
    UserService,
    RequestService,
    RequestLikeService,
    UserAnonymousSessionService,
    RequestPollService,
    UserOptionService,
    ChannelLevelService,
    ChannelPermissionService,
    UserFollowService,
    JwtHelperService,
    QueueService,
    GiftService,
    UserGiftService,
    ChallengePermissionService,
    ChallengeActivityService,
    ChallengeService,
    EventHookWorkerService,
    GiftHelper,
    TransactionHelper,
    ChatMediaService,
    ChatHistoryHelper,
    EventHookNotificationService,
    TransactionService,
    TransactionBankService,
    ChatHistoryService,
    ChatRoomUserOptionService,
    ChatRoomService,
  ],
  exports: [RequestHelper, RequestCategoryService, RequestCommentService, RequestDisLikeService, RequestLikeService, RequestPollService, RequestService],
})
export class RequestModule { }
