import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserService } from "../user/services/user.service";
import { NeedHelpService } from "./services/need_help.service";
import { NeedHelpController } from "./controllers/need_help.controller";
import { NeedHelp, NeedHelpSchema } from "./schemas/need_help.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { NeedHelpHelper } from "./helper/need_help.helper";
import { JwtHelperService } from "../../modules/core/services/jwt_helper.service";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserSessionService } from "../user/services/user_session.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserOptionService } from "../user/services/user_option.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: NeedHelp.name, schema: NeedHelpSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
    ]),
  ],
  controllers: [NeedHelpController],
  providers: [UserService, NeedHelpHelper, NeedHelpService, JwtHelperService, UserSessionService, UserPermissionService, UserOptionService],
})
export class NeedHelpModule { }
