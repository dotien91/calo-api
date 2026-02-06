import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";
import { TrackingController } from "./controllers/tracking.controller";
import { TrackingHelper } from "./helper/tracking.helper";
import { Tracking, TrackingSchema } from "./schemas/tracking.schema";
import { TrackingService } from "./services/tracking.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tracking.name, schema: TrackingSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: UserSession.name, schema: UserSessionSchema },
    ]),
  ],
  controllers: [TrackingController],
  providers: [TrackingService, TrackingHelper, JwtHelperService, UserSessionService, UserPermissionService],
  exports: [TrackingService],
})
export class TrackingModule {}
