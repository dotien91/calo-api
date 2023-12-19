import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtHelperService } from "../../modules/core/services/jwt_helper.service";
import { Subscribe, SubscribeSchema } from "../subscribe/schemas/subscribe.schema";
import { SubscribeService } from "../subscribe/services/subscribe.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserService } from "../user/services/user.service";
import { UserSessionService } from "../user/services/user_session.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { SubscribeController } from "./controllers/subscribe.controller";
import { HandleServiceHelper } from "./helper/handle_service.helper";
import { PlanHelper } from "./helper/plan.helper";
import { HandleService, HandleServiceSchema } from "./schemas/handle_service.schema";
import { Plan, PlanSchema } from "./schemas/plan.schema";
import { HandleServiceService } from "./services/handle_service.service";
import { PlanService } from "./services/plan.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: HandleService.name, schema: HandleServiceSchema },
      { name: Subscribe.name, schema: SubscribeSchema },
    ]),
  ],
  controllers: [SubscribeController],
  providers: [
    SubscribeService,
    UserService,
    PlanHelper,
    PlanService,
    JwtHelperService,
    UserSessionService,
    UserPermissionService,
    HandleServiceHelper,
    HandleServiceService,
  ],
})
export class PlanModule {}
