import { ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { TransactionRefType } from "../../../modules/transaction/interfaces/transaction.interface";
import { TransactionService } from "../../../modules/transaction/services/transaction.service";
import { ListReferralDto } from "../dtos/referral.dto";
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

  async listProductReferredByMe(query: ListReferralDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }
      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;

      let dataToFilter = { referral_user: userId, transaction_type: "output" };

      const dataReturn: any = await this.transactionService.filter(dataToFilter, undefined, page, limit);
      for (const index in dataReturn) {
        dataReturn[index] = dataReturn[index]?.toObject();
      }

      // const finalDataReturn = dataReturn
      //   .filter(
      //     (transaction: any) =>
      //       [TransactionRefType.COURSE, TransactionRefType.PRODUCT].includes(transaction.ref_type) &&
      //       transaction.referral_user
      //   )
      //   .map((transaction: any) => ({
      //     // product: transaction.ref_id,
      //     // referral_user: {
      //     //   _id: transaction.referral_user?._id,
      //     //   user_login: transaction.referral_user?.user_login,
      //     //   display_name: transaction.referral_user?.display_name,
      //     //   user_role: transaction.referral_user?.user_role,
      //     //   user_status: transaction.referral_user?.user_status,
      //     //   user_avatar: transaction.referral_user?.user_avatar,
      //     //   user_avatar_thumbnail: transaction.referral_user?.user_avatar_thumbnail,
      //     //   last_active: transaction.referral_user?.last_active,
      //     //   user_active: transaction.referral_user?.user_active,
      //     //   official_status: transaction.referral_user?.official_status,
      //     //   level: transaction.referral_user?.level,
      //     // },
      //   }));

      const finalDataReturn = dataReturn
        .filter((transaction) => [TransactionRefType.COURSE, TransactionRefType.PRODUCT].includes(transaction.ref_type))
        .sort((transaction_a, transaction_b) => {
          switch (query.sort_by) {
            case "price": {
              return (
                (transaction_a.transaction_value - transaction_b.transaction_value) *
                (query.order_by === "ASC" ? 1 : -1)
              );
            }
            case "time": {
              return (transaction_a.createdAt - transaction_b.createdAt) * (query.order_by === "ASC" ? 1 : -1);
            }
          }
        })
        .map((transaction: any) => ({
          ...transaction.ref_id,
          transaction_value: transaction.transaction_value,
        }));

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(finalDataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
