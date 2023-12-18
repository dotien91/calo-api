import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClockService } from "./services/clock.service";
import { Clock, ClockSchema } from "./schemas/clock.schema";
import { Plan, PlanSchema } from "../plan/schemas/plan.schema";
import { ClockController } from "./controllers/clock.controller";
import { Subscribe, SubscribeSchema } from "../subscribe/schemas/subscribe.schema";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { Purchase, PurchaseSchema } from "../purchase/schemas/purchase.schema";
import { ClockHistory, ClockHistorySchema } from "./schemas/clock_history.schema";
import { ClockHistoryService } from "./services/clock_history.service";
import { ClockHelper } from "./helper/clock.helper";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscribe.name, schema: SubscribeSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: Clock.name, schema: ClockSchema},
      { name: ClockHistory.name, schema: ClockHistorySchema}
    ]),
  ],
  controllers: [ClockController],
  providers: [
    ClockService,
    ClockHistoryService,
    ClockHelper,
    UserPermissionService,
  ],
  exports: [ClockHelper],
})
export class ClockModule {}
