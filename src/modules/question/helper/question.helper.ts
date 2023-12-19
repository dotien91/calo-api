import { Response } from "express";
import { ForbiddenException, HttpStatus, NotFoundException, Injectable, BadRequestException } from "@nestjs/common";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateQuestionDto } from "../dto/create-question.dto";
import { QuestionService } from "../services/question.service";
import { ListQuestionDto } from "../dto/list-question.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateQuestionDto } from "../dto/update-question.dto";
import { AnswerService } from "../services/answer.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class QuestionHelper {
  constructor(
    private questionService: QuestionService,
    private userPermissionService: UserPermissionService,
    private answerService: AnswerService
  ) {}

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewQuestion(createQuestionData: CreateQuestionDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      let dataToAdd: any = createQuestionData;
      if (this.validateJson(createQuestionData?.public_album)) {
        dataToAdd = {
          ...dataToAdd,
          ...{
            public_album: JSON.parse(createQuestionData?.public_album),
          },
        };
      } else {
        dataToAdd = {
          ...dataToAdd,
          ...{
            public_album: [],
          },
        };
      }

      if (this.validateJson(createQuestionData?.question)) {
        dataToAdd = {
          ...dataToAdd,
          ...{
            question: JSON.parse(createQuestionData?.question),
          },
        };
      } else {
        dataToAdd = {
          ...dataToAdd,
          ...{
            question: [],
          },
        };
      }
      let parentData = null;
      if (createQuestionData.parent_id) {
        parentData = await this.questionService.findOne({ _id: createQuestionData.parent_id });
        if (!parentData) {
          throw new ForbiddenException("Parent ID not found!");
        }
      }

      let dataCreate: any = await this.questionService.create(dataToAdd);
      if (parentData) {
        dataCreate = {
          ...dataCreate,
          ...{
            parent_id: parentData,
          },
        };
      }
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param str
   * @returns
   */
  validateJson(str: string) {
    try {
      const dataJson = JSON.parse(str);
      if (dataJson?.length === 0) {
        return false;
      } else {
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getQuestionListByUser(query: ListQuestionDto, res: Response, req: ExpressRequestDto) {
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
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      const dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.questionService.filter(dataToFilter, orderByOBject, page, limit);
      // let dataCount = await this.questionService.count(dataToFilter);
      const dataToAdd = [];
      if (dataReturn) {
        for (const dataItem of dataReturn) {
          const dataFilter = {
            question_id: dataItem._id,
            user_id: userId,
          };
          const answerObject = await this.answerService.findOneWithOutPopulate(dataFilter);
          const dataItemAdd = {
            ...dataItem?.toObject(),
            ...{
              answer: answerObject,
            },
          };
          dataToAdd.push(dataItemAdd);
        }
      }
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataToAdd);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleGetDetailQuestion(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      //Check Permission
      const dataReturn = await this.questionService.findById(id.toString());
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async removeQuestion(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "question/delete")) {
        //Check Permission
        const dataReturn = await this.questionService.remove(id);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleUpdateQuestionByAdmin(dataUpdate: UpdateQuestionDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      //Check Permission
      if (await this.userPermissionService.isHavePermission(userId, "question/update")) {
        let dataToAdd: any = dataUpdate;
        if (this.validateJson(dataUpdate?.public_album)) {
          dataToAdd = {
            ...dataToAdd,
            ...{
              public_album: JSON.parse(dataUpdate?.public_album),
            },
          };
        }

        if (this.validateJson(dataUpdate?.question)) {
          dataToAdd = {
            ...dataToAdd,
            ...{
              question: JSON.parse(dataUpdate?.question),
            },
          };
        } else {
          dataToAdd = {
            ...dataToAdd,
            ...{
              question: [],
            },
          };
        }

        const dataReturn = await this.questionService.update(dataToAdd);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
