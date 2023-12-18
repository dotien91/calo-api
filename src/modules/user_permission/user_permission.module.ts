import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserService } from "../user/services/user.service";
import { UserPermissionService } from "./services/user_permission.service";
import { UserPermissionController } from "./controllers/user_permission.controller";
import { UserPermission, UserPermissionSchema } from "./schemas/user_permission.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserPermissionHelper } from "./helper/update_user_permission.helper";
import { JwtHelperService } from "../../modules/core/services/jwt_helper.service";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: UserSession.name, schema: UserSessionSchema },
    ]),
  ],
  controllers: [UserPermissionController],
  providers: [UserService, UserPermissionHelper, UserPermissionService, JwtHelperService, UserSessionService],
})
export class UserPermissionModule { }
