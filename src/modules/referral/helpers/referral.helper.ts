import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { ListReferralDto } from "../dtos/referral.dto";
import { ReferralService } from "../services/referral.service";

@Injectable()
export class ReferralHelper {
  constructor(private referralService: ReferralService) {}

  async listUserReferredByMe(query: ListReferralDto, res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_id;
      if (!userId) throw new Error("Invalid user");

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
      dataToFilter = { ...dataToFilterBefore, ...dataToFilter, from_user_id: userId };

      const dataReturn = await this.referralService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.referralService.count(dataToFilter);

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

  async listUserReferralMe(query: ListReferralDto, res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_id;
      if (!userId) throw new Error("Invalid user");

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
      dataToFilter = { ...dataToFilterBefore, ...dataToFilter, user_id: userId };

      const dataReturn = await this.referralService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.referralService.count(dataToFilter);

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
}
