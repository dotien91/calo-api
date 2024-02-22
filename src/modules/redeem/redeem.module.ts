import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { EventHookWorkerService } from "../hook/services/hook_do.service";
import { TransactionModule } from "../transaction/transaction.module";
import { UserModule } from "../user/user.module";
import { RedeemController } from "./controllers/redeem.controller";
import { RedeemHelper } from "./helpers/redeem.helper";
import { RedeemMissionHelper } from "./helpers/redeem_mission.helper";
import { Redeem, RedeemSchema } from "./schemas/redeem.schema";
import { RedeemMission, RedeemMissionSchema } from "./schemas/redeem_mission.schema";
import { RedeemUser, RedeemUserSchema } from "./schemas/redeem_user.schema";
import { RedeemService } from "./services/redeem.service";
import { RedeemMissionService } from "./services/redeem_mission.service";
import { RedeemUserService } from "./services/redeem_user.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Redeem.name, schema: RedeemSchema },
      { name: RedeemMission.name, schema: RedeemMissionSchema },
      { name: RedeemUser.name, schema: RedeemUserSchema },
    ]),
    TransactionModule,
    UserModule,
  ],
  controllers: [RedeemController],
  providers: [
    RedeemService,
    RedeemHelper,
    RedeemMissionService,
    RedeemMissionHelper,
    RedeemUserService,
    EventHookWorkerService,
    JwtHelperService,
  ],
  exports: [RedeemService, RedeemHelper, RedeemMissionService, RedeemMissionHelper, RedeemUserService],
})
export class RedeemModule {}

