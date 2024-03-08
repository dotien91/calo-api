import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { TransactionService } from "../../../modules/transaction/services/transaction.service";
import { ListReferralDto } from "../dtos/referral.dto";
import { COIN_TO_TOKEN, ReferralType } from "../interfaces/referral.interface.i";
import { ReferralService } from "../services/referral.service";

@Injectable()
export class ReferralHelper {
  constructor(private referralService: ReferralService, private transactionService: TransactionService) {}

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
      dataToFilter = { ...dataToFilterBefore, ...dataToFilter, from_user_id: userId, type: ReferralType.SIGN_UP };

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
      dataToFilter = { ...dataToFilterBefore, ...dataToFilter, user_id: userId, type: ReferralType.SIGN_UP };

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

  async listProductReferredByMe(query: ListReferralDto, res: Response, req: ExpressRequestDto) {
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
      dataToFilter = { ...dataToFilterBefore, ...dataToFilter, from_user_id: userId, type: ReferralType.BUY_PRODUCT };

      const dataReturn: any = await this.referralService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.referralService.count(dataToFilter);
      for (const dataIndexItem in dataReturn) {
        dataReturn[dataIndexItem] = { ...dataReturn[dataIndexItem]?.toObject() };
      }

      const finalDataReturn = dataReturn
        .sort((referral_a, referral_b) => {
          switch (query.sort_by) {
            case "price": {
              return (referral_a.ref_id.price - referral_b.ref_id.price) * (query.order_by === "ASC" ? 1 : -1);
            }
            case "time": {
              return (referral_a.createdAt - referral_b.createdAt) * (query.order_by === "ASC" ? 1 : -1);
            }
          }
        })
        .map((referral) => ({
          ...referral,
          bonus_percent: (referral.bonus_value * COIN_TO_TOKEN) / referral.ref_id?.price,
        }));

      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
          "X-Total-Count": Number(dataCount),
        })
        .status(HttpStatus.OK)
        .json(this.groupListUserBuyProduct(finalDataReturn));
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  groupListUserBuyProduct(data: any) {
    const groupedData = data.reduce((acc, obj) => {
      const { user_id, ref_id } = obj;
      if (!acc[user_id._id]) {
        acc[user_id._id] = { ...obj, ref_ids: [] };
      }
      acc[user_id._id].ref_ids.push(ref_id);

      delete acc[user_id._id].ref_id;

      return acc;
    }, {});

    const result = Object.values(groupedData);

    return result;
  }
}
