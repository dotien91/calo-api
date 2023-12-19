import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtHelperService } from "../../modules/core/services/jwt_helper.service";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserOption, UserOptionSchema } from "../user/schemas/user_option.schema";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { UserService } from "../user/services/user.service";
import { UserOptionService } from "../user/services/user_option.service";
import { UserSessionService } from "../user/services/user_session.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { ReportController } from "./controllers/report.controller";
import { ReportHelper } from "./helper/report.helper";
import { Report, ReportSchema } from "./schemas/report.schema";
import { ReportService } from "./services/report.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Report.name, schema: ReportSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
    ]),
  ],
  controllers: [ReportController],
  providers: [
    UserService,
    ReportHelper,
    ReportService,
    JwtHelperService,
    UserSessionService,
    UserPermissionService,
    UserOptionService,
  ],
})
export class ReportModule {}
