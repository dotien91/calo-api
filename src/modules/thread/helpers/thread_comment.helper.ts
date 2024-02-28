import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CourseClassService } from "../../../modules/course/services/course_class.service";
import {
  CreateThreadCommentDTO,
  HandleGiveMarkDTO,
  ListThreadCommentDto,
  UpdateThreadCommentDTO,
  UploadCommentDTO,
} from "../dtos/thread_comment.dto";
import { ThreadCommentType } from "../interfaces/thread.interface.i";
import { ThreadService } from "../services/thread.service";
import { ThreadCommentService } from "../services/thread_comment.service";

@Injectable()
export class ThreadCommentHelper {
  constructor(
    private threadCommentService: ThreadCommentService,
    private threadService: ThreadService,
    private courseClassService: CourseClassService
  ) {}

  async list(query: ListThreadCommentDto, res: Response, req: ExpressRequestDto) {
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

      const dataReturn = await this.threadCommentService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.threadCommentService.count(dataToFilter);

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

  async createThreadComment(createThreadCommentData: CreateThreadCommentDTO, res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const dataReturn = await this.threadCommentService.create({
        ...createThreadCommentData,
        user_id: userId,
      });

      if (createThreadCommentData.type === ThreadCommentType.PUBLIC)
        this.threadService.updateCount({ _id: createThreadCommentData?.thread_id }, { comment_count: 1 });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async uploadComment(uploadCommentData: UploadCommentDTO, res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      await this.threadCommentService.upsert(
        {
          thread_id: uploadCommentData.thread_id,
          user_id: userId,
          type: ThreadCommentType.FILE,
        },
        {
          thread_id: uploadCommentData.thread_id,
          user_id: userId,
          type: ThreadCommentType.FILE,
          attach_files: uploadCommentData.attach_files,
        }
      );

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateThreadComment(updateThreadCommentData: UpdateThreadCommentDTO, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const threadComment = await this.threadCommentService.findOne({ _id: updateThreadCommentData._id });
      if (!threadComment) throw new Error("Not found threadComment");

      if (threadComment.user_id.toString() !== userId) throw new Error("You don't have permission to do this");

      const dataReturn = await this.threadCommentService.update(updateThreadCommentData);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async removeThreadComment(id: string, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const threadComment = await this.threadCommentService.findOne({ _id: id });
      if (!threadComment) throw new Error("Thread not found");

      if (threadComment.user_id.toString() === userId) {
        await this.threadCommentService.remove({ _id: id });
        this.threadService.updateCount({ _id: threadComment?.thread_id }, { comment_count: -1 });

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json();
      } else {
        throw new Error("You don't have permission to do that");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleGetDetailThreadComment(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const dataFilter = {
        _id: id,
      };
      //Check Permission
      const dataReturn = await this.threadCommentService.findOne(dataFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateThreadCommentMark(body: HandleGiveMarkDTO, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const thread = await this.threadService.findOne({ _id: body.thread_id });
      if (!thread) throw new Error("Not found thread");
      const courseClass = await this.courseClassService.findOne({ _id: thread.class_id.toString() });
      if (!courseClass) throw new Error("Not found class");
      if (courseClass.user_id.toString() !== userId) throw new Error("You're not teacher");

      const userExam = await this.threadCommentService.findOne({
        user_id: body.user_id,
        type: ThreadCommentType.FILE,
        thread_id: body.thread_id,
      });
      if (!userExam) throw new Error("User don't have exam on this thread");

      const dataReturn = await this.threadCommentService.update({
        _id: userExam._id.toString(),
        mark: body.mark,
      });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
