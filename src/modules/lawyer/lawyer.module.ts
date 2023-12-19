import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LawyerService } from "./services/lawyer.service";
import { Lawyer, LawyerSchema } from "./schemas/lawyer.schema";
import { LawyerHelper } from "./helper/lawyer.helper";
import { LawyerController } from "./controllers/lawyer.controller";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { Purchase, PurchaseSchema } from "../purchase/schemas/purchase.schema";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { UserSessionService } from "../user/services/user_session.service";
import { UserSession, UserSessionSchema } from "../user/schemas/user_session.schema";
import { LawyerType, LawyerTypeSchema } from "./schemas/lawyer_type.schema";
import { LawyerCategory, LawyerCategorySchema } from "./schemas/lawyer_category.schema";
import { LawyerReport, LawyerReportSchema } from "./schemas/lawyer_report.schema";
import { LawyerRating, LawyerRatingSchema } from "./schemas/lawyer_rating.schema";
import { LawyerRatingHelper } from "./helper/lawyer_rating.helper";
import { LawyerTypeHelper } from "./helper/lawyer_type.helper";
import { LawyerTypeController } from "./controllers/lawyer_type.controller";
import { LawyerRatingController } from "./controllers/lawyer_rating.controller";
import { UserFollowLawyerService } from "./services/user_follow_lawyer.service";
import { LawyerReportService } from "./services/lawyer_report.service";
import { LawyerTypeService } from "./services/lawyer_type.service";
import { LawyerRatingService } from "./services/lawyer_rating.service";
import { LawyerCategoryService } from "./services/lawyer_category.service";
import { UserFollowLawyer, UserFollowLawyerSchema } from "./schemas/user_follow_lawyer.schema";
import { LawyerRaw, LawyerRawSchema } from "./schemas/lawyer_raw.schema";
import { LawyerRawService } from "./services/lawyer_rawservice";
import { ChatMedia, ChatMediaSchema } from "../chat_media/schemas/chat_media.schema";
import { ChatMediaService } from "../chat_media/services/chat_media.service";
import { City, CitySchema } from "../city/schemas/city.schema";
import { CityService } from "../city/services/city.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lawyer.name, schema: LawyerSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: LawyerType.name, schema: LawyerTypeSchema },
      { name: LawyerCategory.name, schema: LawyerCategorySchema },
      { name: LawyerReport.name, schema: LawyerReportSchema },
      { name: LawyerRating.name, schema: LawyerRatingSchema },
      { name: UserFollowLawyer.name, schema: UserFollowLawyerSchema },
      { name: LawyerRaw.name, schema: LawyerRawSchema },
      { name: ChatMedia.name, schema: ChatMediaSchema },
      { name: City.name, schema: CitySchema },
    ]),
  ],
  controllers: [LawyerController, LawyerTypeController, LawyerRatingController],
  providers: [
    LawyerService,
    LawyerHelper,
    LawyerRatingHelper,
    LawyerTypeHelper,
    UserPermissionService,
    JwtHelperService,
    UserSessionService,
    UserFollowLawyerService,
    LawyerReportService,
    LawyerTypeService,
    LawyerRatingService,
    LawyerCategoryService,
    CityService,
    LawyerRawService,
    ChatMediaService,
  ],
  exports: [
    LawyerHelper,
    LawyerRatingHelper,
    LawyerService,
    LawyerTypeHelper,
    LawyerReportService,
    LawyerTypeService,
    LawyerRatingService,
    LawyerCategoryService,
    LawyerRawService,
  ],
})
export class LawyerModule {}
