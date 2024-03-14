import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import mongoose from "mongoose";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateTestQuestionDTO, ListTestQuestionDto, UpdateTestQuestionDTO } from "../dtos/test_question.dto";
import { TestQuestionService } from "../services/test_question.service";

@Injectable()
export class TestQuestionHelper {
  constructor(private testQuestionService: TestQuestionService) {}

  async list(query: ListTestQuestionDto, res: Response, req: ExpressRequestDto) {
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

      const dataReturn = await this.testQuestionService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.testQuestionService.count(dataToFilter);

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

  async createTestQuestion(createTestQuestionData: CreateTestQuestionDTO, res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      await this.testQuestionService.createMultipleData(createTestQuestionData.data);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateTestQuestion(updateTestQuestionData: UpdateTestQuestionDTO, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const testQuestion = await this.testQuestionService.findOne({ _id: updateTestQuestionData._id });
      if (!testQuestion) throw new Error("Not found test question");

      const dataReturn = await this.testQuestionService.update(updateTestQuestionData);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async removeTestQuestion(id: string, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");
      const objectId = new mongoose.Types.ObjectId(id);

      const testQuestion = await this.testQuestionService.findOne({ _id: objectId });
      if (!testQuestion) throw new Error("Not found test question");

      await Promise.all([this.testQuestionService.remove({ _id: objectId })]);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleGetDetailTestQuestion(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const dataFilter = {
        _id: id,
      };
      //Check Permission
      const dataReturn = await this.testQuestionService.findOne(dataFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
