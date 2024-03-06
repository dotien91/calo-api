import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateTestUserDTO, ListTestUserDto, UpdateTestUserDTO } from "../dtos/test_user.dto";
import { TestStatus } from "../interfaces/test.interface.i";
import { TestUserService } from "../services/test_user.service";

@Injectable()
export class TestUserHelper {
  constructor(private testUserService: TestUserService) {}

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

  async checkUserTestSubmit(userId: string, data: UpdateTestUserDTO) {
    try {
      await this.testUserService.calculateUserBand(userId, data);
    } catch (e) {
      throw new Error(`Error when check user test submit: ${e.message}`);
    }
  }
}
