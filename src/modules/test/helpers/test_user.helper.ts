import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import {
  RedeemMissionActionTarget,
  RedeemMissionActionType,
} from "../../../modules/redeem/interfaces/redeem.interface.i";
import { RedeemUserService } from "../../../modules/redeem/services/redeem_user.service";
import { CreateTestUserDTO, ListTestUserDto, UpdateTestUserDTO } from "../dtos/test_user.dto";
import { MAX_BAND, TestStatus } from "../interfaces/test.interface.i";
import { TestUserService } from "../services/test_user.service";

@Injectable()
export class TestUserHelper {
  constructor(private testUserService: TestUserService, private redeemUserService: RedeemUserService) {}

  async list(query: ListTestUserDto, res: Response, req: ExpressRequestDto) {
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

      const projection = { answers: 0 };

      const dataReturn = await this.testUserService.filter(dataToFilter, orderByOBject, page, limit, projection);
      const dataCount = await this.testUserService.count(dataToFilter);

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

  async getTestByStatus(status: TestStatus) {
    try {
      const tests = await this.testUserService.findAll({ status });
      return tests;
    } catch (e) {
      console.log("Error when getting users test: ", e.message);
      return [];
    }
  }

  async submit(createTestUserData: CreateTestUserDTO, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) throw new Error("Invalid user");

      const dataReturn = await this.testUserService.create({
        ...createTestUserData,
        status: TestStatus.PENDING,
        user_id: userObject._id.toString(),
      });

      this.redeemUserService.updateUserRedeem(userObject, RedeemMissionActionType.JOIN, RedeemMissionActionTarget.TEST);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleGetDetailTestUser(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const dataFilter = {
        _id: id,
      };
      //Check Permission
      const dataReturn = await this.testUserService.findOne(dataFilter, true);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async checkUserTestSubmit(data: UpdateTestUserDTO) {
    try {
      await this.testUserService.calculateUserBand(data);
    } catch (e) {
      throw new Error(`Error when check user test submit: ${e.message}`);
    }
  }

  async getUserStats(res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_id;
      if (!userId) throw new Error("Invalid user");

      const testsDoneByUser = await this.testUserService.findUniqueTestByUser(userId);
      let listeningCounter = 0;
      let readingCounter = 0;
      let writingCounter = 0;
      let speakingCounter = 0;

      let listeningTotal = 0;
      let readingTotal = 0;
      let writingTotal = 0;
      let speakingTotal = 0;

      for (const test of testsDoneByUser) {
        const { listening_point, reading_point, writing_point, speaking_point } = test.band_detail;

        if (listening_point) {
          listeningCounter = listeningCounter + 1;
          listeningTotal = listeningTotal + listening_point / MAX_BAND;
        }

        if (reading_point) {
          readingCounter = readingCounter + 1;
          readingTotal = readingTotal + reading_point / MAX_BAND;
        }

        if (writing_point) {
          writingCounter = writingCounter + 1;
          writingTotal = writingTotal + writing_point / MAX_BAND;
        }

        if (speaking_point) {
          speakingCounter = speakingCounter + 1;
          speakingTotal = speakingTotal + speaking_point / MAX_BAND;
        }
      }

      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
        })
        .status(HttpStatus.OK)
        .json({
          listening_percentage: listeningCounter > 0 ? listeningTotal / listeningCounter : 0,
          reading_percentage: readingCounter > 0 ? readingTotal / readingCounter : 0,
          writing_percentage: writingCounter > 0 ? writingTotal / writingCounter : 0,
          speaking_percentage: speakingCounter > 0 ? speakingTotal / speakingCounter : 0,
        });
    } catch (e) {
      throw new Error(`Error when check user test submit: ${e.message}`);
    }
  }
}
