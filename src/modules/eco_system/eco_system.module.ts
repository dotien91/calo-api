import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EcoSystemService } from "./services/eco_system.service";
import { EcoSystem, EcoSystemSchema } from "./schemas/eco_system.schema";
import { EcoSystemHelper } from "./helper/eco_system.helper";
import { EcoSystemController } from "./controllers/eco_system.controller";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EcoSystem.name, schema: EcoSystemSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
    ]),
  ],
  controllers: [EcoSystemController],
  providers: [EcoSystemService, EcoSystemHelper, UserPermissionService],
  exports: [EcoSystemHelper, EcoSystemService],
})
export class EcoSystemModule { }
