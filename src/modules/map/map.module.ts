import { Module } from "@nestjs/common";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { MapController } from "./controllers/map.controller";
import { MapHelper } from "./helper/map.helper";
import { MongooseModule } from "@nestjs/mongoose";
import { MapToken, MapTokenSchema } from "./schemas/map_token.schema";
import { MapTokenService } from "./services/map_token.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: MapToken.name, schema: MapTokenSchema }])],
  controllers: [MapController],
  providers: [MapHelper, MapTokenService],
  exports: [MapHelper],
})
export class MapModule {}
