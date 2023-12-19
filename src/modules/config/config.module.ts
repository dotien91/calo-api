import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HandleService, HandleServiceSchema } from "../plan/schemas/handle_service.schema";
import { Plan, PlanSchema } from "../plan/schemas/plan.schema";
import { HandleServiceService } from "../plan/services/handle_service.service";
import { PlanService } from "../plan/services/plan.service";
import { Subscribe, SubscribeSchema } from "../subscribe/schemas/subscribe.schema";
import { SubscribeService } from "../subscribe/services/subscribe.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserService } from "../user/services/user.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { ConfigController } from "./controllers/config.controller";
import { ConfigHelper } from "./helper/config.helper";
import { Config, ConfigSchema } from "./schemas/config.schema";
import { ConfigService } from "./services/config.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscribe.name, schema: SubscribeSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Config.name, schema: ConfigSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: HandleService.name, schema: HandleServiceSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ConfigController],
  providers: [
    PlanService,
    SubscribeService,
    ConfigService,
    ConfigHelper,
    UserPermissionService,
    HandleServiceService,
    UserService
  ],
  exports: [ConfigHelper],
})
export class ConfigModule {}
