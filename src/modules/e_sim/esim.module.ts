import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EsimService } from "./services/esim.service";
import { Esim, EsimSchema } from "./schemas/esim.schema";
import { EsimHelper } from "./helper/esim.helper";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { EsimController } from "./controllers/esim.controller";
import { EsimCountry, EsimCountrySchema } from "./schemas/esim_country.schema";
import { EsimCountryService } from "./services/esim_country.service";
import { Plan, PlanSchema } from "../plan/schemas/plan.schema";
import { PlanService } from "../plan/services/plan.service";
import { HandleService, HandleServiceSchema } from "../plan/schemas/handle_service.schema";
import { HandleServiceService } from "../plan/services/handle_service.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Esim.name, schema: EsimSchema },
      { name: EsimCountry.name, schema: EsimCountrySchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: HandleService.name, schema: HandleServiceSchema },
    ]),
  ],
  controllers: [EsimController],
  providers: [EsimService, EsimHelper, EsimCountryService, PlanService, UserPermissionService, HandleServiceService],
  exports: [EsimHelper, EsimService, EsimCountryService],
})
export class EsimModule {}
