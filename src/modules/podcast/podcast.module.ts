import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { NotificationModule } from "../notification/notification.module";
import { QueueService } from "../queue/queue.service";
import { SocketModule } from "../socket/socket.module";
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
import { PodcastController } from "./controllers/podcast.controller";
import { PodcastHelper } from "./helper/podcast.helper";
import { PodcastCategory, PodcastCategorySchema } from "./schemas/podcast-category.schema";
import { Podcast, PodcastSchema } from "./schemas/podcast.schema";
import { PodcastService } from "./services/podcast.service";
import { PodcastCategoryService } from "./services/podcast_category.service";

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
      { name: Podcast.name, schema: PodcastSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: PodcastCategory.name, schema: PodcastCategorySchema },
      { name: UserAnonymousSession.name, schema: UserAnonymousSessionSchema },
      { name: UserAnonymous.name, schema: UserAnonymousSchema },
      { name: User.name, schema: UserSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: UserFollow.name, schema: UserFollowSchema },
    ]),
    SocketModule,
    NotificationModule,
  ],
  controllers: [PodcastController],
  providers: [
    UserSessionService,
    PodcastService,
    PodcastHelper,
    UserPermissionService,
    PodcastCategoryService,
    UserAnonymousService,
    UserService,
    PodcastService,
    UserAnonymousSessionService,
    UserFollowService,
    JwtHelperService,
    QueueService,
    EventHookWorkerService,
  ],
  exports: [PodcastHelper, PodcastCategoryService, PodcastService],
})
export class PodcastModule {}
