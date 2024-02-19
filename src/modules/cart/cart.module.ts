import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CartController } from "./controllers/cart.controller";
import { CartHelper } from "./helpers/cart.helper";
import { Cart, CartSchema } from "./schemas/cart.schema";
import { CartService } from "./services/cart.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }])],
  controllers: [CartController],
  providers: [CartService, CartHelper],
  exports: [CartService],
})
export class CartModule {}

