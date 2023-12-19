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
import { ContactFormController } from "./controllers/contact_form.controller";
import { ContactFormHelper } from "./helper/contact_from.helper";
import { ContactForm, ContactFormSchema } from "./schemas/contact_form.schema";
import { ContactFormService } from "./services/contact_form.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ContactForm.name, schema: ContactFormSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: UserOption.name, schema: UserOptionSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
    ]),
  ],
  controllers: [ContactFormController],
  providers: [
    UserService,
    ContactFormHelper,
    ContactFormService,
    JwtHelperService,
    UserSessionService,
    UserPermissionService,
    UserOptionService,
  ],
})
export class ContactFormModule {}
