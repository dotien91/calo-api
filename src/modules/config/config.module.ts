import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigService } from "./services/config.service";
import { Config, ConfigSchema } from "./schemas/config.schema";
import { Plan, PlanSchema } from "../plan/schemas/plan.schema";
import { PlanService } from "../plan/services/plan.service";
import { ConfigHelper } from "./helper/config.helper";
import { ConfigController } from "./controllers/config.controller";
import { SubscribeService } from "../subscribe/services/subscribe.service";
import { Subscribe, SubscribeSchema } from "../subscribe/schemas/subscribe.schema";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { HandleService, HandleServiceSchema } from "../plan/schemas/handle_service.schema";
import { HandleServiceService } from "../plan/services/handle_service.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserService } from "../user/services/user.service";
import { Channel, ChannelSchema } from "../channel/schemas/channel.schema";
import { ChannelService } from "../channel/services/channel.service";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { ChatMediaService } from "../chat_media/services/chat_media.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscribe.name, schema: SubscribeSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Config.name, schema: ConfigSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: HandleService.name, schema: HandleServiceSchema },
      { name: User.name, schema: UserSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema }
    ]),
  ],
  controllers: [ConfigController],
  providers: [
    ChatMediaService,
    PlanService,
    SubscribeService,
    ConfigService,
    ConfigHelper,
    UserPermissionService,
    HandleServiceService,
    UserService,
    ChannelService,
  ],
  exports: [ConfigHelper],
})
export class ConfigModule { }
