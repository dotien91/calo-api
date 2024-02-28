import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import mongoose from "mongoose";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CourseClassService } from "../../../modules/course/services/course_class.service";
import { CreateThreadDTO, ListThreadDto, UpdateThreadDTO } from "../dtos/thread.dto";
import { ThreadCommentType } from "../interfaces/thread.interface.i";
import { ThreadService } from "../services/thread.service";

@Injectable()
export class ThreadHelper {
  constructor(private threadService: ThreadService, private courseClassService: CourseClassService) {}

  async list(query: ListThreadDto, res: Response, req: ExpressRequestDto) {
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

      const dataReturn: any = await this.threadService.filter(dataToFilter, orderByOBject, page, limit);

      for (let dataIndexItem in dataReturn) {
        dataReturn[dataIndexItem] = { ...dataReturn[dataIndexItem]?.toObject() };
      }

      // check if the thread is for assigned user only
      const finalReturnData = dataReturn.filter((data) => {
        if (data.assigned_user_ids?.length) {
          if (data.assigned_user_ids.find((id) => id.toString() === userId)) return data;
          else return false;
        }
        return data;
      });

      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
        })
        .status(HttpStatus.OK)
        .json(finalReturnData);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async createThread(createThreadData: CreateThreadDTO, res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const dataReturn = await this.threadService.create({
        ...createThreadData,
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

  async updateThread(updateThreadData: UpdateThreadDTO, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const thread = await this.threadService.findOne({ _id: updateThreadData._id });
      if (!thread) throw new Error("Not found thread");

      if (thread.user_id.toString() !== userId) throw new Error("You don't have permission to do this");

      const dataReturn = await this.threadService.update(updateThreadData);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async removeThread(id: string, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      const userId = req?.user_id?.toString();
      if (!userId) throw new Error("Invalid user");

      const thread = await this.threadService.findOne({ _id: id });
      if (!thread) throw new Error("Not found thread");

      if (thread.user_id.toString() !== userId) throw new Error("You don't have permission to do this");

      await Promise.all([this.threadService.remove({ _id: new mongoose.Types.ObjectId(id) })]);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleGetDetailThread(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userId = req?.user_id;
      if (!userId) throw new Error("Invalid user");

      const dataReturn = await this.threadService.findById(id);
      const courseClass = await this.courseClassService.findOne({ _id: dataReturn.class_id });

      const finalDataReturn = dataReturn.map((thread) => {
        const public_comment = thread.thread_comments.filter((elem) => elem.type === ThreadCommentType.PUBLIC);
        const private_comment = thread.thread_comments.filter((elem) => {
          return (
            elem.type === ThreadCommentType.PRIVATE &&
            (userId === elem.user_id.toString() ||
              (courseClass.user_id.toString() === elem.user_id.toString() &&
                elem.reply_to_user_id.toString() === userId))
          );
        });
        const file_comment = thread.thread_comments.filter((elem) => {
          return elem.type === ThreadCommentType.FILE && elem.user_id.toString() === userId;
        })[0];
        const data = {
          ...thread,
          thread_comments: {
            public_comment,
            private_comment,
            file_comment: file_comment || null,
          },
        };
        return {
          ...data,
          is_late_submit: this.isLateSubmit(thread.expired, data.thread_comments.file_comment),
        };
      })[0];

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(finalDataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  isLateSubmit(expired: string, file_comment: any): boolean {
    if (!file_comment) return false;
    const submitTime = new Date(file_comment.createdAt);
    const expiredTime = new Date(expired);

    if (submitTime > expiredTime) return true;
    return false;
  }
}

