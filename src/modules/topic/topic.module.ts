import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TopicService } from "./services/topic.service";
import { Topic, TopicSchema } from "./schemas/topic.schema";
import { Plan, PlanSchema } from "../plan/schemas/plan.schema";
import { PlanService } from "../plan/services/plan.service";
import { TopicHelper } from "./helper/topic.helper";
import { TopicController } from "./controllers/topic.controller";
import { SubscribeService } from "../subscribe/services/subscribe.service";
import { Subscribe, SubscribeSchema } from "../subscribe/schemas/subscribe.schema";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { Purchase, PurchaseSchema } from "../purchase/schemas/purchase.schema";
import { PurchaseService } from "../purchase/services/purchase.service";
import { ChatRoom, ChatRoomSchema } from "../chat_room/schemas/chat_room.schema";
import { ChatRoomService } from "../chat_room/services/chat_room.service";
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from "../chat_room/schemas/chat_room_user_option.schema";
import { ChatRoomUserOptionService } from "../chat_room/services/chat_room_user_option.service";
import { TopicPost, TopicPostSchema } from "./schemas/topic_post.schema";
import { TopicPostService } from "./services/topic_post.service";
import { TopicPostHelper } from "./helper/topic_post.helper";
import { TopicJoin, TopicJoinSchema } from "./schemas/topic_join.schema";
import { TopicJoinService } from "./services/topic_join.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscribe.name, schema: SubscribeSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Topic.name, schema: TopicSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
      { name: TopicPost.name, schema: TopicPostSchema },
      { name: TopicJoin.name, schema: TopicJoinSchema },
    ]),
  ],
  controllers: [TopicController],
  providers: [
    PlanService,
    SubscribeService,
    TopicJoinService,
    ChatRoomUserOptionService,
    ChatRoomService,
    TopicService,
    PurchaseService,
    TopicPostService,
    TopicPostHelper,
    TopicHelper,
    UserPermissionService,
  ],
  exports: [TopicHelper],
})
export class TopicModule {}
