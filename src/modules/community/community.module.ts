import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { GptService } from "../gpt/services/gpt.service";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { EventHookNotificationService } from "../hook/services/hook_notification.service";
import { NotificationHelper } from "../notification/helper/notification.helper";
import { Notification, NotificationSchema } from "../notification/schemas/notification.schema";
import { NotificationService } from "../notification/services/notification.service";
import { QueueService } from "../queue/queue.service";
import { TransactionHelper } from "../transaction/helper/transaction.helper";
import { Transaction, TransactionSchema } from "../transaction/schemas/transaction.schema";
import { TransactionBank, TransactionBankSchema } from "../transaction/schemas/transaction_bank.schema";
import { TransactionService } from "../transaction/services/transaction.service";
import { TransactionBankService } from "../transaction/services/transaction_bank.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserAnonymous, UserAnonymousSchema } from "../user/schemas/user_anonymous.schema";
import { UserAnonymousSession, UserAnonymousSessionSchema } from "../user/schemas/user_anonymous_session.schema";
import { UserFollow, UserFollowSchema } from "../user/schemas/user_follow.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserService } from "../user/services/user.service";
import { UserAnonymousService } from "../user/services/user_anonymous.service";
import { UserAnonymousSessionService } from "../user/services/user_anonymous_session.service";
import { UserFollowService } from "../user/services/user_follow.service";
import { UserSessionService } from "../user/services/user_session.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { CommunityController } from "./controllers/community.controller";
import { CommunityHelper } from "./helper/community.helper";
import { CommunityCategory, CommunityCategorySchema } from "./schemas/community-category.schema";
import { CommunityComment, CommunityCommentSchema } from "./schemas/community-comment.schema";
import { Community, CommunitySchema } from "./schemas/community.schema";
import { CommunityDisLike, CommunityDisLikeSchema } from "./schemas/community_dislike.schema";
import { CommunityLike, CommunityLikeSchema } from "./schemas/community_like.schema";
import { CommunityPoll, CommunityPollSchema } from "./schemas/community_poll.schema";
import { CommunityService } from "./services/community.service";
import { CommunityCategoryService } from "./services/community_category.service";
import { CommunityCommentService } from "./services/community_comment.service";
import { CommunityDisLikeService } from "./services/community_dislike.service";
import { CommunityLikeService } from "./services/community_like.service";
import { CommunityPollService } from "./services/community_poll.service";

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
      { name: Community.name, schema: CommunitySchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: CommunityCategory.name, schema: CommunityCategorySchema },
      { name: CommunityComment.name, schema: CommunityCommentSchema },
      { name: CommunityLike.name, schema: CommunityLikeSchema },
      { name: UserAnonymousSession.name, schema: UserAnonymousSessionSchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: User.name, schema: UserSchema },
      { name: CommunityDisLike.name, schema: CommunityDisLikeSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: CommunityPoll.name, schema: CommunityPollSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: TransactionBank.name, schema: TransactionBankSchema },
    ]),
  ],
  controllers: [CommunityController],
  providers: [
    CommunityDisLikeService,
    UserSessionService,
    NotificationService,
    NotificationHelper,
    CommunityService,
    CommunityHelper,
    UserPermissionService,
    CommunityCategoryService,
    UserAnonymousService,
    CommunityCommentService,
    UserService,
    CommunityService,
    CommunityLikeService,
    UserAnonymousSessionService,
    CommunityPollService,
    UserFollowService,
    JwtHelperService,
    QueueService,
    EventHookWorkerService,
    TransactionHelper,
    EventHookNotificationService,
    TransactionService,
    TransactionBankService,
    GptService,
  ],
  exports: [
    CommunityHelper,
    CommunityCategoryService,
    CommunityCommentService,
    CommunityDisLikeService,
    CommunityLikeService,
    CommunityPollService,
    CommunityService,
  ],
})
export class CommunityModule {}
