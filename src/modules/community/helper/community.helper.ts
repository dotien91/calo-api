import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { Response } from "express";
import { Types } from "mongoose";
import { ExpressRequestDto } from "src/dto/express-request.dto";
import { NotificationHelper } from "src/modules/notification/helper/notification.helper";
import { User } from "src/modules/user/schemas/user.schema";
import { UserService } from "src/modules/user/services/user.service";
import { UserFollowService } from "src/modules/user/services/user_follow.service";
import { UserPermissionService } from "src/modules/user_permission/services/user_permission.service";
import { CreateCommunityDto } from "../dto/create-community.dto";
import { CreateCommunityCategoryDto } from "../dto/create-community_category.dto";
import { CreateCommunityCommentDto } from "../dto/create-community_comment.dto";
import { CreateCommunityLikeDto } from "../dto/create-community_like.dto";
import { CreateCommunityPollDto } from "../dto/create-community_poll.dto";
import { FilterListVote } from "../dto/filter-list_vote.dto";
import { ListCommunityDto } from "../dto/list-community.dto";
import { ListCommunityCategoryDto } from "../dto/list-community_category.dto";
import { ListCommunityCommentDto } from "../dto/list-community_comment.dto";
import { ListCommunityLikeDto } from "../dto/list-community_like.dto";
import { UpdateCommunityDto } from "../dto/update-community.dto";
import { UpdateCommunityCategoryDto } from "../dto/update-community_category.dto";
import { UpdateCommunityCommentDto } from "../dto/update-community_comment.dto";
import { CommunityComment } from "../schemas/community-comment.schema";
import { Community as CommunityNew } from "../schemas/community.schema";
import { CommunityService } from "../services/community.service";
import { CommunityCategoryService } from "../services/community_category.service";
import { CommunityCommentService } from "../services/community_comment.service";
import { CommunityDisLikeService } from "../services/community_dislike.service";
import { CommunityLikeService } from "../services/community_like.service";
import { CommunityPollService } from "../services/community_poll.service";


/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class CommunityHelper {
  constructor(
    private communityService: CommunityService,
    private communityCategoryService: CommunityCategoryService,
    private userPermissionService: UserPermissionService,
    private communityLikeService: CommunityLikeService,
    private communityDisLikeService: CommunityDisLikeService,
    private communityCommentService: CommunityCommentService,
    private userService: UserService,
    private notificationHelper: NotificationHelper,
    private communityPollService: CommunityPollService,
    private userFollowService: UserFollowService,
  ) {}

  /**
   * @author Tony Vu
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getListCommunityLike(query: ListCommunityLikeDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let dataToFilter = { ...query };

      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      let dataCommunity = await this.communityService.findOne({ _id: query?.community_id });
      if (!dataCommunity) {
        throw new ForbiddenException("Community is invalid!");
      }

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      let dataReturn: any = await this.communityLikeService.filterData(dataToFilter, orderByOBject, page, limit);     

      if (dataReturn) {
        let dataLikeId = dataReturn?.map((value) => {
          return value?.user_id?._id.toString();
        });
        let dataLikeFilter = {
          user_id: query?.auth_id,
          partner_ids: dataLikeId,
        };
        let dataLikeArray = await this.userFollowService.filter(dataLikeFilter, {}, 1, limit);
        let dataLikeIds = dataLikeArray?.map((value) => {
          return value?.partner_id?._id?.toString();
        });

        for (let dataReturnItem in dataReturn) {
          let userIdCheck = dataReturn[dataReturnItem]?.user_id?._id?.toString();
          if (dataLikeIds.indexOf(userIdCheck) !== -1) {
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem]?.toObject(), ...{ is_follow: true } };
          } else {
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem]?.toObject(), ...{ is_follow: false } };
          }
        }
      }
      let dataCount = await this.communityLikeService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param dataCreate
   * @param res
   * @param req
   * @returns
   */
  async createNewCommunityPoll(dataCreate: CreateCommunityPollDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let dataQuestion = JSON.parse(dataCreate.question);
      let dataReturn = [];
      let dataToUpdatePoll = [];
      for (let dataQuestionItem of dataQuestion) {
        let dataCreateNew = {
          ...dataCreate,
          ...{ question: dataQuestionItem, created_by: userObject?._id?.toString() },
        };
        if (dataCreate?.community_id) {
          dataCreateNew = { ...dataCreateNew, ...{ community_id: dataCreate?.community_id } };
        }
        let dataPollReturn = await this.communityPollService.create(dataCreateNew);
        dataToUpdatePoll.push(dataPollReturn?._id?.toString());
        dataReturn.push(dataPollReturn);
      }
      if (dataCreate?.community_id) {
        //Update Community
        let dataUpdate = {
          poll_ids: dataToUpdatePoll,
          _id: dataCreate?.community_id,
        };
        await this.communityService.update(dataUpdate);
      }
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param dataCreate
   * @param res
   * @param req
   * @returns
   */
  async unVoteCommunityPoll(dataCreate: CreateCommunityPollDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject: any = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let dataChoose = await this.communityPollService.findById(dataCreate?.poll_id, {});
      if (dataChoose?.users_choose?.indexOf(userObject?._id) == -1) {
        //Not have
        throw new ForbiddenException("Not Vote");
      }
      if (dataCreate?.poll_id && dataCreate?.community_id) {
        let dataUpdate = {
          _id: dataCreate?.poll_id,
          users_choose: userObject?._id?.toString(),
        };

        //Update
        //Update Number
        let dataUpdateCount = {
          number_choose: -1,
        };
        await this.communityPollService.updateCount({ _id: dataCreate?.poll_id }, dataUpdateCount);
        let dataReturn = await this.communityPollService.updateArray(dataUpdate, true);

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new ForbiddenException("Data invalid!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param dataCreate
   * @param res
   * @param req
   * @returns
   */
  async voteCommunityPoll(dataCreate: CreateCommunityPollDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject: any = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      if (dataCreate?.poll_id && dataCreate?.community_id) {
        //ReUpdate
        let dataPollArray = await this.communityPollService.filter({ community_id: dataCreate?.community_id }, {}, 1, 1000);
        for (let dataItemPool of dataPollArray) {
          if (dataItemPool?.users_choose?.indexOf(userObject?._id) !== -1) {
            //Update
            let dataUpdateCount = {
              number_choose: -1,
            };
            await this.communityPollService.updateCount({ _id: dataItemPool?._id }, dataUpdateCount);
            let dataUpdateNew = {
              _id: dataItemPool?._id?.toString(),
              users_choose: userObject?._id?.toString(),
            };
            await this.communityPollService.updateArray(dataUpdateNew, true);
          }
        }
        let dataUpdate = {
          _id: dataCreate?.poll_id,
          users_choose: userObject?._id?.toString(),
        };

        //Update
        //Update Number
        let dataUpdateCount = {
          number_choose: 1,
        };
        await this.communityPollService.updateCount({ _id: dataCreate?.poll_id }, dataUpdateCount);

        let dataReturn = await this.communityPollService.updateArray(dataUpdate);

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new ForbiddenException("Data invalid!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param dataCreate
   * @param res
   * @param req
   * @returns
   */
  async handleGetListVote(query: FilterListVote, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000 || !query.limit) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;

      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      let dataVote = await this.communityPollService.findOneWithLimit(query, limit, page, orderByOBject);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataVote);
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
  async getListCommunity(query: ListCommunityDto, res: Response, req: ExpressRequestDto) {
    try {
      // console.log(req.headers, "req.headers");
      if (Number(query.limit) > 1000 || !query.limit) {
        query.limit = 1000;
      }
      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;

      let orderByOBject = {};
      if (query.order_by && (query.order_type == "time" || !query?.order_type)) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      if (query.order_by && query.order_type == "most_popular") {
        orderByOBject = { ...orderByOBject, ...{ popular_number: query.order_by } };
      }

      if (query.order_by && query.order_type == "most_upvote") {
        orderByOBject = { ...orderByOBject, ...{ vote_number: "DESC" } };
      }

      if (query.order_by && query.order_type == "most_downvote") {
        orderByOBject = { ...orderByOBject, ...{ vote_number: "ASC" } };
      }

      if (query.order_by && query.order_type == "trending") {
        orderByOBject = { ...orderByOBject, ...{ trending_number: query.order_by } };
      }

      let dataToFilter = { ...query};

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      let dataReturn = await this.communityService.filter(dataToFilter, orderByOBject, page, limit);      

      if (dataReturn) {
        let dataIds = [];
        for (let itemReturn of dataReturn) {
          dataIds.push(itemReturn?._id);
        }
        let dataLikeFilter = {
          user_id: query?.auth_id ? query?.auth_id : null,
          community_ids: dataIds,
        };
        let dataLikeArray = [];
        let dataDisLikeArray = [];
        if (query?.auth_id) {
          dataLikeArray = await this.communityLikeService.filter(dataLikeFilter, {}, 1, limit);
          dataDisLikeArray = await this.communityDisLikeService.filter(dataLikeFilter, {}, 1, limit);
        }

        let dataLikeId = [];
        for (let dataLikeItem of dataLikeArray) {
          dataLikeId.push(dataLikeItem?.community_id.toString());
        }
        for (let dataIndexItem in dataReturn) {
          dataReturn[dataIndexItem] = { ...dataReturn[dataIndexItem]?.toObject() };
        }

        let dataDisLikeId = [];
        for (let dataDisLikeItem of dataDisLikeArray) {
          dataDisLikeId.push(dataDisLikeItem?.community_id.toString());
        }

        for (let dataReturnItem in dataReturn) {
          let communityId = dataReturn[dataReturnItem]?._id?.toString();
          if (dataLikeId.indexOf(communityId) !== -1) {
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ is_like: true } };
          } else {
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ is_like: false } };
          }

          if (dataDisLikeId.indexOf(communityId) !== -1) {
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ is_dislike: true } };
          } else {
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ is_dislike: false } };
          }
        }
      }

      let dataCount = await this.communityService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      console.log(error, "error");
      throw new NotFoundException(error.message);
    }
  }

  
  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewCommunity(createCommunityData: CreateCommunityDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let authCode = req?.auth_code;

      let dataSlug = this.toSlug(createCommunityData.post_title);
      createCommunityData = { ...createCommunityData, ...{ post_slug: dataSlug, user_id: userObject._id.toString() } };

      let userCountry = userObject?.country;
      createCommunityData = { ...createCommunityData, ...{ country: userCountry } };

      if (this.validateJson(createCommunityData?.attach_files)) {
        createCommunityData = {
          ...createCommunityData,
          ...{
            attach_files: JSON.parse(createCommunityData?.attach_files),
          },
        };
      } else {
        createCommunityData = {
          ...createCommunityData,
          ...{
            attach_files: [],
          },
        };
      }

      if (this.validateJson(createCommunityData?.poll_ids)) {
        createCommunityData = {
          ...createCommunityData,
          ...{
            poll_ids: JSON.parse(createCommunityData?.poll_ids),
          },
        };
      } else {
        createCommunityData = {
          ...createCommunityData,
          ...{
            poll_ids: [],
          },
        };
      }

      createCommunityData = { ...createCommunityData, ...{ popular_number: 10, trending_number: 10 } };

      let dataCreate: any = await this.communityService.create(createCommunityData);
      let dataReturn = await this.communityService.findById(dataCreate?._id?.toString());

      //Update Notification
      let dataUpdateNotification = {
        _id: userObject?._id?.toString(),
        notification_community: dataCreate?._id?.toString(),
      };
      await this.userService.updateArray(dataUpdateNotification, false);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      console.log(error, 'error');
      throw new NotFoundException(error.message);
    }
  }

  

  /**
   * @author Tony Vu
   * @param fromUser
   * @param toUser
   * @param chatContent
   * @param orderPnr
   * @returns
   */
  async handleSendNotification(
    fromUser: User,
    dataCommunity: CommunityNew,
    dataComment: CommunityComment,
    authCode: string,
    req: ExpressRequestDto
  ) {
    try {
      let notificationTitle = fromUser.display_name ? fromUser.display_name : fromUser.user_login;
      let chatContentToSend = `${notificationTitle} đã bình luận trong bài viết: ${dataComment.content}`;
      if (chatContentToSend && chatContentToSend.length >= 255) {
        chatContentToSend = chatContentToSend.substring(0, 250) + "...";
      }
      notificationTitle = notificationTitle + ` đã bình luận trong "${dataCommunity?.post_title}`;

      if (notificationTitle && notificationTitle.length >= 70) {
        notificationTitle = notificationTitle.substring(0, 68) + '..."';
      } else {
        notificationTitle = notificationTitle + '"';
      }

      let userIdArray = [];
      let emailArray = [];

      // let dataUser = await this.userService.filter({ notification_community: dataCommunity?._id?.toString() }, {}, 1, 1000);
      let dataUser = [];
      for (let userItem of dataUser) {
        if (userItem?._id?.toString() !== fromUser?._id?.toString()) {
          userIdArray.push(userItem._id.toString());
          emailArray.push(userItem);
        }
      }

      if (userIdArray && userIdArray?.length) {
        let dataToSendNotification = {
          community_id: dataCommunity?._id?.toString(),
          path: "/v/post/",
          data_id: dataCommunity?.post_slug?.toString(),
        };
        let notificationContent = chatContentToSend;
        let dataNotification = {
          createdBy: fromUser._id.toString(),
          user_id: userIdArray,
          channel_id: req?.channel_id,
          title: notificationTitle?.toString(),
          content: notificationContent,
          param: JSON.stringify(dataToSendNotification),
          community_id: dataCommunity?._id?.toString(),
          type_action: "link",
          router: "NAVIGATION_LIST_NOTIFICATIONS_SCREEN",
          click_action: "",
          image: "",
          channel: "user",
        };
        await this.notificationHelper.handleSendNotification(dataNotification, authCode);
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewComment(createCommunityData: CreateCommunityCommentDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject: any = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let authCode = req?.auth_code;

      let dataCommunityObject = await this.communityService.findById(createCommunityData?.community_id);

      let dataCountUserFilter = {
        community_id: createCommunityData?.community_id,
        user_id: userObject?._id?.toString(),
      };
      let dataCountUser = await this.communityCommentService.count(dataCountUserFilter);
      if (!dataCommunityObject) {
        throw new ForbiddenException("Community not exist!");
      }

      createCommunityData = { ...createCommunityData, ...{ user_id: userObject._id.toString() } };

      let dataCreate: any = await this.communityCommentService.create(createCommunityData);

      dataCreate = { ...dataCreate?.toObject(), ...{ user_id: userObject } };
      if (createCommunityData?.parent_id) {
        let dataUpdate = {
          _id: createCommunityData?.parent_id,
          child: dataCreate?._id,
        };
        await this.communityCommentService.updateArray(dataUpdate, false);
      }

      //Update Count
      let dataUpdateCount = {
        _id: createCommunityData?.community_id,
      };
      let dataUpdate = {
        comment_number: 1,
      };
      let dataCommunity = await this.communityService.updateCount(dataUpdateCount, dataUpdate);

      //Update child

      if (createCommunityData?.parent_id) {
        let dataToUpdateArray = {
          child_number: 1,
        };
        await this.communityCommentService.updateCount({ _id: createCommunityData?.parent_id }, dataToUpdateArray);
      }

      //Update Notification
      let dataUpdateNotification = {
        _id: userObject?._id?.toString(),
        notification_community: createCommunityData?.community_id,
      };
      await this.userService.updateArray(dataUpdateNotification, false);

      setTimeout(async () => {
        await this.handleSendNotification(userObject, dataCommunity, dataCreate, authCode, req);
      }, 500);

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
   * @param dataCreate
   * @param res
   * @param req
   */
  async createLike(dataCreate: CreateCommunityLikeDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let dataCommunityObject = await this.communityService.findById(dataCreate?.community_id);
      if (!dataCommunityObject) {
        throw new ForbiddenException("Community not exist!");
      }

      let dataToCreate = {
        user_id: userObject?._id,
        community_id: dataCreate?.community_id,
      };

      //Check
      let dataCheck = await this.communityLikeService.findOne(dataToCreate);

      if (dataCheck) {
        let dataRemove: any = await this.communityLikeService.removeOne(dataToCreate);
        let dataFilter = {
          _id: dataCreate?.community_id,
        };
        //Like Number
        let dataLikeNumber = await this.communityService.updateCount(dataFilter, { like_number: -1, vote_number: -1 });
        dataRemove = dataRemove?.toObject();
        dataRemove = {
          ...dataRemove,
          ...{ is_like: false, like_number: dataLikeNumber?.like_number, vote_number: dataLikeNumber?.vote_number },
        };

        //Un upvote
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataRemove);
      } else {
        //Remove Dislike
        let dataRemove = await this.communityDisLikeService.removeOne(dataToCreate);
        let dataReturn: any = await this.communityLikeService.create(dataToCreate);

        //Update like
        let dataUpdate = {
          like_number: 1,
          vote_number: 1,
        };

        if (dataRemove) {
          dataUpdate = { ...dataUpdate, ...{ vote_number: 2, dislike_number: -1 } };
        }
        let dataFilter = {
          _id: dataCreate?.community_id,
        };

        let dataLikeNumber = await this.communityService.updateCount(dataFilter, dataUpdate);
        dataReturn = dataReturn?.toObject();
        dataReturn = {
          ...dataReturn,
          ...{ is_like: true, like_number: dataLikeNumber?.like_number, vote_number: dataLikeNumber?.vote_number },
        };

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param dataCreate
   * @param res
   * @param req
   */
  async createDislike(dataCreate: CreateCommunityLikeDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let dataToCreate = {
        user_id: userObject?._id,
        community_id: dataCreate?.community_id,
      };

      //Check
      let dataCheck = await this.communityDisLikeService.findOne(dataToCreate);

      if (dataCheck) {
        let dataRemove = await this.communityDisLikeService.removeOne(dataToCreate);
        let dataFilter = {
          _id: dataCreate?.community_id,
        };
        await this.communityService.updateCount(dataFilter, { dislike_number: -1, vote_number: 1 });
        //Un upvote
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataRemove);
      } else {
        let dataReturn = await this.communityDisLikeService.create(dataToCreate);
        let dataRemove = await this.communityLikeService.removeOne(dataToCreate);
        //Update like
        let dataUpdate = {
          vote_number: -1,
          dislike_number: 1,
        };
        let dataFilter = {
          _id: dataCreate?.community_id,
        };

        if (dataRemove) {
          dataUpdate = { ...dataUpdate, ...{ like_number: -1, vote_number: -2 } };
        }
        await this.communityService.updateCount(dataFilter, dataUpdate);

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param dataCreate
   * @param res
   * @param req
   */
  async createLikeComment(dataCreate: CreateCommunityLikeDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject: any = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let authCode = req?.auth_code;

      //CheckComment
      let dataComment = await this.communityCommentService.findOne({ _id: dataCreate?.comment_id });
      let communityId = dataComment?.community_id?.toString();

      let dataCommunityObject = await this.communityService.findById(communityId);
      if (!dataCommunityObject) {
        throw new ForbiddenException("Community not exist!");
      }

      let isLike = false;
      let isRemove = false;
      let isDownVoteBefore = false;
      let dataReturn: any = null;
      if (dataComment?.up_vote) {
        if (dataComment?.up_vote.indexOf(userObject?._id) !== -1) {
          isRemove = true;
        }
      }

      if (dataComment?.down_vote) {
        if (dataComment?.down_vote.indexOf(userObject?._id) !== -1) {
          isDownVoteBefore = true;
        }
      }
      //remove or add Up-vote
      let dataUpdateDownVote = {
        _id: dataCreate?.comment_id,
        up_vote: userObject?._id,
      };
      dataReturn = await this.communityCommentService.updateArray(dataUpdateDownVote, isRemove);

      if (isDownVoteBefore) {
        //Remove Downvote
        let dataUpdateUpVote = {
          _id: dataCreate?.comment_id,
          down_vote: userObject?._id,
        };
        await this.communityCommentService.updateArray(dataUpdateUpVote, true);
      } else {
        isLike = true;
      }

      //Update Number
      let dataUpdateNumber = 0;
      if (isDownVoteBefore) {
        dataUpdateNumber = dataUpdateNumber + 1;
      }
      if (isRemove) {
        dataUpdateNumber = dataUpdateNumber - 1;
      } else {
        dataUpdateNumber = dataUpdateNumber + 1;
      }
      await this.communityCommentService.updateCount({ _id: dataCreate?.comment_id }, { vote_number: dataUpdateNumber });
      dataReturn = { ...dataReturn, ...{ is_like: isLike } };

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param dataCreate
   * @param res
   * @param req
   */
  async createDislikeComment(dataCreate: CreateCommunityLikeDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject: any = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      //CheckComment
      let dataComment = await this.communityCommentService.findOne({ _id: dataCreate?.comment_id });

      let isRemove = false;
      let isUpvoteBefore = false;
      let dataReturn: any = null;

      if (dataComment?.down_vote) {
        if (dataComment?.down_vote.indexOf(userObject?._id) !== -1) {
          isRemove = true;
        }
      }

      if (dataComment?.up_vote) {
        if (dataComment?.up_vote.indexOf(userObject?._id) !== -1) {
          isUpvoteBefore = true;
        }
      }
      //Remove or add Downvote
      let dataUpdateDownVote = {
        _id: dataCreate?.comment_id,
        down_vote: userObject?._id,
      };
      dataReturn = await this.communityCommentService.updateArray(dataUpdateDownVote, isRemove);

      //Update vote Number
      let dataUpdateNumber = 0;
      if (isUpvoteBefore) {
        dataUpdateNumber = dataUpdateNumber - 1;
      }
      if (isRemove) {
        dataUpdateNumber = dataUpdateNumber + 1;
      } else {
        dataUpdateNumber = dataUpdateNumber - 1;
      }

      if (isUpvoteBefore) {
        //Remove Downvote
        let dataUpdateUpVote = {
          _id: dataCreate?.comment_id,
          up_vote: userObject?._id,
        };
        await this.communityCommentService.updateArray(dataUpdateUpVote, true);
      }

      await this.communityCommentService.updateCount({ _id: dataCreate?.comment_id }, { vote_number: dataUpdateNumber });

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
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createCategory(createCommunityData: CreateCommunityCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let dataSlug = this.toSlug(createCommunityData.category_title?.toString());
      createCommunityData = { ...createCommunityData, ...{ category_slug: dataSlug, user_id: userObject._id.toString() } };

      let dataCreate = await this.communityCategoryService.create(createCommunityData);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
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
  async getListCommunityComment(query: ListCommunityCommentDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000 || !query.limit) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByOBject = {};

      let dataToFilter = { ...query };

      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      let dataCommunity = await this.communityService.findOne({ _id: query?.community_id });
      if (!dataCommunity) {
        throw new ForbiddenException("Community is invalid");
      }

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      let dataReturnBefore = await this.communityCommentService.filter(dataToFilter, orderByOBject, page, limit);
      let dataReturn: any = [];
      for (let itemBefore of dataReturnBefore) {
        dataReturn.push(itemBefore?.toObject());
      }
      let dataCount = await this.communityCommentService.count(dataToFilter);
      let dataReturnFinal = [];

      for (let dataItem of dataReturn) {
        let isLike = false;
        let isDislike = false;
        let dataDisLike = dataItem?.down_vote;
        let dataLike = dataItem?.up_vote;

        let dataDisLikeArray = [];
        for (let itemDislike of dataDisLike) {
          dataDisLikeArray.push(itemDislike?.toString());
        }
        if (dataDisLikeArray.indexOf(query?.auth_id) !== -1) {
          isDislike = true;
        }

        let dataLikeArray = [];
        for (let itemLike of dataLike) {
          dataLikeArray.push(itemLike?.toString());
        }
        if (dataLikeArray.indexOf(query?.auth_id) !== -1) {
          isLike = true;
        }
        let dataChild = [];
        if (dataItem && dataItem?.child) {
          for (let dataChildIndex in dataItem?.child) {
            let dataItemChild = dataItem?.child[dataChildIndex];

            let isUpvoteChild = false;
            let dataUpvoteChild = dataItemChild?.up_vote;
            let dataUpvoteChildArray = [];
            for (let itemDislikeChild of dataUpvoteChild) {
              dataUpvoteChildArray.push(itemDislikeChild?.toString());
            }
            if (dataUpvoteChildArray.indexOf(query?.auth_id) !== -1) {
              isUpvoteChild = true;
            }

            let isDownVoteChild = false;
            let dataDownVoteChild = dataItemChild?.down_vote;
            let dataDownvoteChildArray = [];
            for (let itemDislikeChild of dataDownVoteChild) {
              dataDownvoteChildArray.push(itemDislikeChild?.toString());
            }
            if (dataDownvoteChildArray.indexOf(query?.auth_id) !== -1) {
              isDownVoteChild = true;
            }
            dataItemChild = {
              ...dataItem?.child[dataChildIndex],
              ...{ is_like: isUpvoteChild, is_dislike: isDownVoteChild },
            };
            dataChild.push(dataItemChild);
          }
        }
        let dataToPush = { ...dataItem, ...{ is_like: isLike, is_dislike: isDislike, child: dataChild } };
        dataReturnFinal.push(dataToPush);
      }
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturnFinal);
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
      let dataJson = JSON.parse(str);
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
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleGetDetailCommunity(id: string, query: ListCommunityDto, res: Response, req: ExpressRequestDto) {
    try {
      if (!id) {
        throw new ForbiddenException("Id is not invalid");
      }
      let objectId = null;
      try {
        objectId = new Types.ObjectId(id.toString());
      } catch (error) {
        objectId = null;
      }
      //Check Permission

      let dataToFilter = {};
      if (objectId) {
        dataToFilter = { ...dataToFilter, ...{ _id: objectId } };
      } else {
        dataToFilter = { ...dataToFilter, ...{ post_slug: id.toString() } };
      }

      let dataReturn: any = await this.communityService.findOne(dataToFilter);
      dataReturn = { ...dataReturn?.toObject() };

      let getDataLike = null;
      let dataDisLike = null;
      if (query?.auth_id) {
        let dataToFilterLike = {
          user_id: query?.auth_id,
          community_id: dataReturn?._id?.toString(),
        };
        getDataLike = await this.communityLikeService.findOne(dataToFilterLike);
        dataDisLike = await this.communityDisLikeService.findOne(dataToFilterLike);
      }

      if (getDataLike) {
        dataReturn = { ...dataReturn, ...{ is_like: true } };
      } else {
        dataReturn = { ...dataReturn, ...{ is_like: false } };
      }

      if (dataDisLike) {
        dataReturn = { ...dataReturn, ...{ is_dislike: true } };
      } else {
        dataReturn = { ...dataReturn, ...{ is_dislike: false } };
      }

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
  async handleGetDetailCategory(id: string, res: Response, req: ExpressRequestDto) {
    try {
      if (!id) {
        throw new ForbiddenException("Id is not invalid");
      }
      let objectId = null;
      try {
        objectId = new Types.ObjectId(id.toString());
      } catch (error) {
        objectId = null;
      }
      //Check Permission

      let dataToFilter = {};
      if (objectId) {
        dataToFilter = { ...dataToFilter, ...{ _id: objectId } };
      } else {
        dataToFilter = { ...dataToFilter, ...{ category_slug: id.toString() } };
      }
      let dataReturn = await this.communityCategoryService.findOne(dataToFilter);
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
  async handleGetDetailComment(id: string, res: Response, req: ExpressRequestDto) {
    try {
      if (!id) {
        throw new ForbiddenException("Id is not invalid");
      }
      let objectId = null;
      try {
        objectId = new Types.ObjectId(id.toString());
      } catch (error) {
        objectId = null;
      }
      //Check Permission

      let dataToFilter = {};
      if (objectId) {
        dataToFilter = { ...dataToFilter, ...{ _id: objectId } };
      }
      let dataReturn = await this.communityCommentService.findOne(dataToFilter);
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
  async handleUpdateCommunityByAdmin(dataUpdate: UpdateCommunityDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let userId = userObject._id.toString();
      let communityObject = await this.communityService.findById(dataUpdate?._id?.toString());
      
      let havePermission = false;
      let canPin = false;
      
      if (communityObject?.user_id?._id?.toString() == userId) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "community/update")) {
        havePermission = true;
      }

      if (!canPin) {
        delete dataUpdate?.is_pin;
      }

      if (!havePermission) {
        throw new BadRequestException("You haven't permission for this Action!");
      }

      if (dataUpdate.public_album) {
        dataUpdate = { ...dataUpdate, ...{ public_album: JSON.parse(dataUpdate.public_album) } };
      }
      if (dataUpdate.attach_files) {
        dataUpdate = { ...dataUpdate, ...{ attach_files: JSON.parse(dataUpdate.attach_files) } };
      }
      if (dataUpdate.poll_ids) {
        dataUpdate = { ...dataUpdate, ...{ poll_ids: JSON.parse(dataUpdate.poll_ids) } };
      }

      let dataReturn = await this.communityService.update(dataUpdate);
      
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
  async handleUpdateCommunityComment(dataUpdate: UpdateCommunityCommentDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let userId = userObject._id.toString();
      //Check Comment ID
      let commentObject = await this.communityCommentService.findById(dataUpdate?._id?.toString());

      //Check User create
      if (commentObject?.user_id?.toString() !== userObject?._id?.toString()) {
        let dataPermission = await this.userPermissionService.isHavePermission(userId, "community/update");
        if (!dataPermission) {
          throw new BadRequestException("You haven't permission for this Action!");
        }
      }

      let dataReturn = await this.communityCommentService.update(dataUpdate);
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
  async handleUpdateCategory(dataUpdate: UpdateCommunityCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let dataReturn = await this.communityCategoryService.update(dataUpdate);
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
  async handleDeleteCommunity(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }

      let userId = userObject._id.toString();
      let communityObject = await this.communityService.findById(id);
      let havePermission = false;
      if (communityObject?.user_id?._id?.toString() == userId) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "community/delete")) {
        havePermission = true;
      }

      if (havePermission) {
        //Check Permission
        let dataReturn = await this.communityService.remove(id);
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
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getCommunityCategoryList(query: ListCommunityCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000 || !query.limit) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByOBject = {};

      let dataToFilter = { ...query };

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      let dataReturn = await this.communityCategoryService.filter(dataToFilter, orderByOBject, page, limit);
      let dataCount = await this.communityCategoryService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleDeleteComment(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      let getCommentObject = await this.communityCommentService.findByIdPopulate(id);
      let havePermission = false;

      if (getCommentObject?.user_id?._id?.toString() == userId) {
        havePermission = true;
      }

      if (await this.userPermissionService.isHavePermission(userId, "community/delete")) {
        havePermission = true;
      }
      if (havePermission) {
        //Check Permission
        let dataReturn: any = await this.communityCommentService.remove(id);

        if (dataReturn?.parent_id) {
          let dataUpdateRemove = {
            _id: dataReturn?.parent_id?.toString(),
            child: dataReturn?._id,
          };
          await this.communityCommentService.updateArray(dataUpdateRemove, true);
        }

        //check subcomment
        let subcomments = await this.communityCommentService.filter({
          parent_id: id
        }, {}, 1, 999);

        //Update Count
        let dataUpdateCount = {
          _id: getCommentObject?.community_id?._id?.toString(),
        };
        let dataUpdate = {
          comment_number: -(subcomments.length + 1),
        };
        await this.communityService.updateCount(dataUpdateCount, dataUpdate);

        //Update child
        if (getCommentObject?.parent_id) {
          let dataToUpdateArray = {
            child_number: -(subcomments.length + 1),
          };
          await this.communityCommentService.updateCount(
            { _id: getCommentObject?.parent_id?.toString() },
            dataToUpdateArray
          );
        }

        await this.communityCommentService.deleteManyByIds(subcomments.map((subcomment) => {
          return subcomment?._id.toString();
        }))

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
  async handleDeleteCategory(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "community/delete")) {
        //Check Permission
        let dataReturn = await this.communityCategoryService.remove(id);
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
   *
   * @param str
   * @returns
   */
  toSlug(str: string) {
    str = str.toLowerCase();
    str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, "a");
    str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, "e");
    str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, "i");
    str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, "o");
    str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, "u");
    str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, "y");
    str = str.replace(/(đ)/g, "d");
    str = str.replace(/([^0-9a-z-\s])/g, "");
    str = str.replace(/(\s+)/g, "-");
    str = str.replace(/^-+/g, "");
    str = str.replace(/-+$/g, "") + (new Date()).getTime();
    return str;
  }
}
