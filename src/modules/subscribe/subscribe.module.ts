import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserService } from "../user/services/user.service";
import { SubscribeService } from "./services/subscribe.service";
import { SubscribeController } from "./controllers/subscribe.controller";
import { Subscribe, SubscribeSchema } from "./schemas/subscribe.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { SubscribeHelper } from "./helper/subscribe.helper";
import { JwtHelperService } from "../../modules/core/services/jwt_helper.service";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { Plan, PlanSchema } from "../plan/schemas/plan.schema";
import { PlanService } from "../plan/services/plan.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Subscribe.name, schema: SubscribeSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: Plan.name, schema: PlanSchema },
    ]),
  ],
  controllers: [SubscribeController],
  providers: [
    UserService,
    SubscribeHelper,
    PlanService,
    SubscribeService,
    JwtHelperService,
    UserSessionService,
    UserPermissionService,
  ],
})
export class SubscribeModule {}
