import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import mongoose from "mongoose";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateShopDTO, ListShopDto, UpdateShopDTO } from "../dtos/shop.dto";
import { ShopService } from "../services/shop.service";

@Injectable()
export class ShopHelper {
  constructor(private shopService: ShopService) {}

  async list(query: ListShopDto, res: Response, req: ExpressRequestDto) {
    try {
      let dataToFilter = {};
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      const dataToFilterBefore = query;
      delete dataToFilterBefore.page;
      delete dataToFilterBefore.limit;
      delete dataToFilterBefore.order_by;
      dataToFilter = { ...dataToFilterBefore, ...dataToFilter };

      const dataReturn = await this.shopService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.shopService.count(dataToFilter);

      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
          "X-Total-Count": Number(dataCount),
        })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async createShop(createShopData: CreateShopDTO, res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const shop = await this.shopService.findOne({ user_id: userId });
      if (shop) throw new Error("You already have a shop for yourself");

      const dataReturn = await this.shopService.create({
        ...createShopData,
        user_id: userId,
      });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateShop(updateShopData: UpdateShopDTO, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const shop = await this.shopService.findOne({ _id: updateShopData._id });
      if (!shop) throw new Error("Not found shop");

      if (shop.user_id.toString() !== userId) throw new Error("You don't have permission to do this");

      const dataReturn = await this.shopService.update(updateShopData);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async removeShop(id: string, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const shop = await this.shopService.findOne({ _id: id });
      if (!shop) throw new Error("Not found shop");

      if (shop.user_id.toString() !== userId) throw new Error("You don't have permission to do this");

      await Promise.all([this.shopService.remove({ _id: new mongoose.Types.ObjectId(id) })]);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleGetDetailShop(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const dataFilter = {
        _id: id,
      };
      //Check Permission
      const dataReturn = await this.shopService.findOne(dataFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
