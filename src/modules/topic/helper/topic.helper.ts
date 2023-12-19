import { Response, Request } from "express";
import {
  ForbiddenException,
  HttpStatus,
  NotFoundException,
  Injectable,
  BadRequestException,
  Res,
  Req,
  Param,
} from "@nestjs/common";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateTopicDto } from "../dto/create-topic.dto";
import { TopicService } from "../services/topic.service";
import { ListTopicDto } from "../dto/list-topic.dto";
import { PlanService } from "../../../modules/plan/services/plan.service";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateTopicDto } from "../dto/update-topic.dto";
import { SubscribeService } from "../../../modules/subscribe/services/subscribe.service";
import { ChatRoomService } from "../../../modules/chat_room/services/chat_room.service";
import { ChatRoomUserOptionService } from "../../../modules/chat_room/services/chat_room_user_option.service";
import { TopicJoinService } from "../services/topic_join.service";
import { ListTopicJoinDto } from "../dto/list-topic_join.dto";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class TopicHelper {
  constructor(
    private topicService: TopicService,
    private planService: PlanService,
    private userPermissionService: UserPermissionService,
    private subscribeService: SubscribeService,
    private chatRoomService: ChatRoomService,
    private chatRoomUserOptionService: ChatRoomUserOptionService,
    private topicJoinService: TopicJoinService
  ) {}

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewTopic(createTopicData: CreateTopicDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      let dataToAdd: any = createTopicData;
      if (this.validateJson(createTopicData?.public_album)) {
        dataToAdd = {
          ...dataToAdd,
          ...{
            public_album: JSON.parse(createTopicData?.public_album),
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
      let parentData = null;
      if (createTopicData.parent_id) {
        parentData = await this.topicService.findOne({ _id: createTopicData.parent_id });
        if (!parentData) {
          throw new ForbiddenException("Parent ID not found!");
        }
      }

      //Create Chat Room

      //Update Chat Group
      const dataCreateRoom = {
        user_id: process.env.INFO_SESSION,
        room_type: "group",
        room_limit_number: 100000,
        room_private: 0,
        chat_history_count: 0,
        group_partners: [userObject._id.toString()],
        partner_count: 1,
        room_name: createTopicData.name,
        room_description: createTopicData?.description,
        last_message: "New group",
        room_image: createTopicData.image?.trim(),
      };
      console.log(dataCreateRoom);
      const dataCreateReturnRoom = await this.chatRoomService.create(dataCreateRoom);

      let groupId = null;
      if (dataCreateReturnRoom) {
        groupId = dataCreateReturnRoom._id.toString();
        //Ad User Support in To New City
        //Process Save User & Advisor To Option
        const dataOptionUser = {
          chat_room_id: dataCreateReturnRoom?._id.toString(),
          user_role: "admin",
          user_permission: "write",
          room_type: "group",
          user_id: userObject._id.toString(),
          room_title: "",
          room_image: "",
          chat_history_count: 1,
        };
        await this.chatRoomUserOptionService.create(dataOptionUser);
        dataToAdd = {
          ...dataToAdd,
          ...{
            chat_room_id: groupId,
          },
        };
      }

      let dataCreate: any = await this.topicService.create(dataToAdd);

      //Update Room Ref
      const dataUpdate = {
        _id: dataCreateReturnRoom._id.toString(),
        topic_id: dataCreate._id.toString(),
      };
      await this.chatRoomService.update(dataUpdate);
      dataCreate = {
        ...dataCreate.toObject(),
        ...{
          chat_room_id: dataCreateReturnRoom,
        },
      };
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
      console.log(error);
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
  async getTopicListByUser(query: ListTopicDto, res: Response, req: ExpressRequestDto) {
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
      const dataReturn = await this.topicService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.topicService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
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
  async getJoinList(query: ListTopicJoinDto, res: Response, req: ExpressRequestDto) {
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
      const dataReturn = await this.topicJoinService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.topicJoinService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
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
  async handleGetDetailTopic(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      //Check Permission
      const dataReturn = await this.topicService.findById(id.toString());
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
  async handleDeleteTopic(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "topic/delete")) {
        //Check Permission
        const dataReturn = await this.topicService.remove(id);
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
  async handleUpdateTopicByAdmin(dataUpdate: UpdateTopicDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      //Check Permission
      if (await this.userPermissionService.isHavePermission(userId, "topic/update")) {
        let dataToAdd: any = dataUpdate;
        if (this.validateJson(dataUpdate?.public_album)) {
          dataToAdd = {
            ...dataToAdd,
            ...{
              public_album: JSON.parse(dataUpdate?.public_album),
            },
          };
        }

        const dataReturn = await this.topicService.update(dataToAdd);
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
