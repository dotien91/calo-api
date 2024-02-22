import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import mongoose from "mongoose";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateRedeemDTO, ListRedeemDto, UpdateRedeemDTO } from "../dtos/redeem.dto";
import { RedeemService } from "../services/redeem.service";

@Injectable()
export class RedeemHelper {
  constructor(private redeemService: RedeemService) {}

  async list(query: ListRedeemDto, res: Response, req: ExpressRequestDto) {
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

      const dataReturn = await this.redeemService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.redeemService.count(dataToFilter);

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

  async createRedeem(createRedeemData: CreateRedeemDTO, res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const dataReturn = await this.redeemService.create({
        ...createRedeemData,
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

  async updateRedeem(updateRedeemData: UpdateRedeemDTO, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const redeem = await this.redeemService.findOne({ _id: updateRedeemData._id });
      if (!redeem) throw new Error("Not found redeem");

      if (redeem.user_id.toString() !== userId) throw new Error("You don't have permission to do this");

      const dataReturn = await this.redeemService.update(updateRedeemData);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async removeRedeem(id: string, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const redeem = await this.redeemService.findOne({ _id: id });
      if (!redeem) throw new Error("Not found redeem");

      if (redeem.user_id.toString() !== userId) throw new Error("You don't have permission to do this");

      await Promise.all([this.redeemService.remove({ _id: new mongoose.Types.ObjectId(id) })]);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleGetDetailRedeem(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const dataReturn = await this.redeemService.getListMissionOfRedeem(id);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}

