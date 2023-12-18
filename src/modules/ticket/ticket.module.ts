import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TicketService } from "./services/ticket.service";
import { Ticket, TicketSchema } from "./schemas/ticket.schema";
import { TicketHelper } from "./helper/ticket.helper";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { TicketCategory, TicketCategorySchema } from "./schemas/ticket-category.schema";
import { TicketCategoryService } from "./services/ticket_category.service";
import { TicketController } from "./controllers/ticket.controller";
import { TicketComment, TicketCommentSchema } from "./schemas/ticket-comment.schema";
import { TicketCommentService } from "./services/ticket_comment.service";
import { UserAnonymousSession, UserAnonymousSessionSchema } from "../user/schemas/user_anonymous_session.schema";
import { UserAnonymousSessionService } from "../user/services/user_anonymous_session.service";
import { UserAnonymous, UserAnonymousSchema } from "../user/schemas/user_anonymous.schema";
import { UserAnonymousService } from "../user/services/user_anonymous.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserService } from "../user/services/user.service";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationService } from "../notification/services/notification.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserOptionService } from "../user/services/user_option.service";
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
import { GiftModule } from "../gift/gift.module";
import { RedeemMission, RedeemMissionSchema } from "../redeem/schemas/redeem_mission.schema";
import { TransactionModule } from "../transaction/transaction.module";

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
      { name: Ticket.name, schema: TicketSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: TicketCategory.name, schema: TicketCategorySchema },
      { name: TicketComment.name, schema: TicketCommentSchema },
      { name: UserAnonymousSession.name, schema: UserAnonymousSessionSchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: UserOption.name, schema: UserOptionSchema },
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
    ]),
    GiftModule
  ],
  controllers: [TicketController],
  providers: [
    ChannelService,
    UserSessionService,
    NotificationService,
    NotificationHelper,
    TicketService,
    TicketHelper,
    UserPermissionService,
    TicketCategoryService,
    UserAnonymousService,
    TicketCommentService,
    UserService,
    TicketService,
    UserAnonymousSessionService,
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
    EventHookNotificationService,
  ],
  exports: [TicketHelper, TicketCategoryService, TicketCommentService, TicketService],
})
export class TicketModule { }
