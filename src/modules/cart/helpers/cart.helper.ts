import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import mongoose from "mongoose";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CartHandleDTO } from "../dtos/cart.dto";
import { Cart } from "../schemas/cart.schema";
import { CartService } from "../services/cart.service";

@Injectable()
export class CartHelper {
  constructor(private cartService: CartService) {}

  async handleCart(data: CartHandleDTO, res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_object?._id?.toString();
      if (!userId) throw new Error("Invalid user");

      let dataReturn = null;

      const cart = await this.cartService.findOne({ user_id: new mongoose.Types.ObjectId(userId) });
      if (!cart) dataReturn = await this.createCart(data, userId);
      else {
        if (cart.user_id.toString() !== userId) throw new Error("You don't have permission to do this");
        dataReturn = await this.updateCart(cart, data);
      }

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async createCart(createCartData: CartHandleDTO, userId: string) {
    try {
      const items = createCartData.items.map((item) => {
        return {
          ...item,
          product_id: new mongoose.Types.ObjectId(item.product_id),
        };
      });

      const dataReturn = await this.cartService.create({
        user_id: userId,
        items,
      });
      return dataReturn;
    } catch (error) {
      return new NotFoundException(error.message);
    }
  }

  async updateCart(cart: Cart, updateCartData: CartHandleDTO) {
    try {
      const items = updateCartData.items.map((item) => {
        return {
          ...item,
          product_id: new mongoose.Types.ObjectId(item.product_id),
        };
      });

      const dataReturn = await this.cartService.update({
        _id: cart._id.toString(),
        items,
      });
      return dataReturn;
    } catch (error) {
      return new NotFoundException(error.message);
    }
  }

  async handleGetDetailCart(res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_object?._id?.toString();
      if (!userId) throw new Error("Invalid user");

      const dataFilter = {
        user_id: new mongoose.Types.ObjectId(userId),
      };

      const dataReturn = await this.cartService.findOne(dataFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
