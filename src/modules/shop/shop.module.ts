import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ShopController } from "./controllers/shop.controller";
import { ShopHelper } from "./helpers/shop.helper";
import { Shop, ShopSchema } from "./schemas/shop.schema";
import { ShopService } from "./services/shop.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: Shop.name, schema: ShopSchema }])],
  controllers: [ShopController],
  providers: [ShopService, ShopHelper],
  exports: [ShopService],
})
export class ShopModule {}

