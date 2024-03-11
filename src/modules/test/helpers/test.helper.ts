import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import mongoose from "mongoose";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateTestDTO, ListTestDto, UpdateTestDTO } from "../dtos/test.dto";
import { TestService } from "../services/test.service";
import { TestUserService } from "../services/test_user.service";

@Injectable()
export class TestHelper {
  constructor(private testService: TestService, private testUserService: TestUserService) {}

  async list(query: ListTestDto, res: Response, req: ExpressRequestDto) {
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
      dataToFilter = { ...dataToFilterBefore, ...dataToFilter };

      const dataReturn: any = await this.testService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.testService.count(dataToFilter);
      for (const dataIndexItem in dataReturn) {
        dataReturn[dataIndexItem] = { ...dataReturn[dataIndexItem]?.toObject() };
      }

      const testsDoneByUser = await this.testUserService.findUniqueTestByUser(userId);
      const finalDataReturn = dataReturn.map((test) => ({
        ...test,
        is_done: testsDoneByUser.find((testDoneByUser) => {
          return (
            testDoneByUser._id.user_id.toString() === userId &&
            testDoneByUser._id.test_id.toString() === test._id.toString()
          );
        })
          ? true
          : false,
      }));

      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
          "X-Total-Count": Number(dataCount),
        })
        .status(HttpStatus.OK)
        .json(finalDataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async createTest(createTestData: CreateTestDTO, res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const dataReturn = await this.testService.create({
        ...createTestData,
        created_user_id: userId,
      });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateTest(updateTestData: UpdateTestDTO, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const test = await this.testService.findOne({ _id: updateTestData._id });
      if (!test) throw new Error("Not found test");

      if (test.created_user_id.toString() !== userId) throw new Error("You don't have permission to do this");

      const dataReturn = await this.testService.update(updateTestData);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async removeTest(id: string, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const test = await this.testService.findOne({ _id: id });
      if (!test) throw new Error("Not found test");

      if (test.created_user_id.toString() !== userId) throw new Error("You don't have permission to do this");

      await Promise.all([this.testService.remove({ _id: new mongoose.Types.ObjectId(id) })]);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleGetDetailTest(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const dataFilter = {
        _id: id,
      };
      //Check Permission
      const dataReturn = await this.testService.findOne(dataFilter, true);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
