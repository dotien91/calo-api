import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RedeemController } from "./controllers/redeem.controller";
import { RedeemHelper } from "./helpers/redeem.helper";
import { RedeemMissionHelper } from "./helpers/redeem_mission.helper";
import { Redeem, RedeemSchema } from "./schemas/Redeem.schema";
import { RedeemMission, RedeemMissionSchema } from "./schemas/redeem_mission.schema";
import { RedeemService } from "./services/redeem.service";
import { RedeemMissionService } from "./services/redeem_mission.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Redeem.name, schema: RedeemSchema },
      { name: RedeemMission.name, schema: RedeemMissionSchema },
    ]),
  ],
  controllers: [RedeemController],
  providers: [RedeemService, RedeemHelper, RedeemMissionService, RedeemMissionHelper],
  exports: [RedeemService],
})
export class RedeemModule {}

