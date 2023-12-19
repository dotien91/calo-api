import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserService } from "../user/services/user.service";
import { ReportService } from "./services/report.service";
import { ReportController } from "./controllers/report.controller";
import { Report, ReportSchema } from "./schemas/report.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { ReportHelper } from "./helper/report.helper";
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
