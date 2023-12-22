import { BadRequestException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Response } from "express";
import * as _ from "lodash";
import { Types } from "mongoose";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { ChatHistoryHelper } from "../../../modules/chat_history/helpers/chat_history.helper";
import { ChatHistoryService } from "../../../modules/chat_history/services/chat_history.service";
import { JwtHelperService } from "../../../modules/core/services/jwt_helper.service";
import { MediaService } from "../../../modules/media/services/media.service";
import { TransactionHelper } from "../../../modules/transaction/helper/transaction.helper";
import { User } from "../../../modules/user/schemas/user.schema";
import { UserFollowService } from "../../../modules/user/services/user_follow.service";
import { UserSessionService } from "../../../modules/user/services/user_session.service";
import { UserService } from "../../user/services/user.service";
import { DeleteChatRoomUserRoleDto } from "../dto/delete-chat_room_user_role.dto";
import { GetChatRoomListDto } from "../dto/get-chat_room_list.dto";
import { GetSameGroupDto } from "../dto/get-same_group.dto";
import { UpdateChatRoomUserDto } from "../dto/update-chat_room_user.dto";
import { UpdateChatRoomUserRoleDto } from "../dto/update-chat_room_user_role.dto";
import { ChatRoom } from "../schemas/chat_room.schema";
import { ChatRoomService } from "../services/chat_room.service";
import { ChatRoomUserOptionService } from "../services/chat_room_user_option.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class ChatRoomHelper {
  constructor(
    private appUserService: UserService,
    private jwtHelper: JwtHelperService,
    private chatRoomUserOptionService: ChatRoomUserOptionService,
    private chatRoomService: ChatRoomService,
    private chatHistoryService: ChatHistoryService,
    private mediaService: MediaService,
    private userSessionService: UserSessionService,
    private transactionHelper: TransactionHelper,
    private chatHistoryHelper: ChatHistoryHelper,
    private userFollowService: UserFollowService
  ) {}

  private readonly logger = new Logger("user_login");

  /**
   * @author Tony Vu
   * @param userId
   * @param partnerId
   * @param chatType
   * @returns
   */
  async handleCreateRoom(
    userObject: User,
    partnerId: string,
    chatType: "personal" | "group" | "anonymous",
    roomName: string = "",
    isReturn: boolean = false,
    req: ExpressRequestDto = null,
    isPayment: number = 0
  ) {
    try {
      if (chatType === "personal" || chatType === "anonymous") {
        let sessionObject = null;
        let authCode = null;
        if (req) {
          sessionObject = req?.session_data;
          authCode = req?.auth_code;
        }
        let userId = userObject._id.toString();
        //Check Chat Room
        let dataToFind = {
          user_id: userId,
          partner_id: partnerId,
          room_type: chatType,
        };
        let dataRoomUserOption = await this.chatRoomUserOptionService.findOne(dataToFind);
        if (dataRoomUserOption) {
          let dataToReturn = dataRoomUserOption.toObject();
          return dataToReturn;
        } else {
          let dataPartner = await this.appUserService.findById(partnerId, {});
          if (!dataPartner || !Number(dataPartner.user_status)) {
            if (!isReturn) {
              throw new BadRequestException("Partner is not exist!");
            } else {
              return null;
            }
          }

          let roomTitleUser = dataPartner?.display_name ? dataPartner?.display_name : dataPartner?.user_login;
          let roomTitlePartner = userObject?.display_name ? userObject?.display_name : userObject?.user_login;

          let dataCreate = {
            user_id: userId,
            room_type: chatType,
            room_limit_number: 100,
            room_private: 1,
            chat_history_count: 0,
            last_message: "Send message to " + roomTitleUser,
          };

          let dataCreateReturn = await this.chatRoomService.create(dataCreate);
          //Process Save User & Advisor To Option
          let dataOptionUser = {
            chat_room_id: dataCreateReturn._id.toString(),
            user_role: userObject.user_role ? userObject.user_role : "user",
            user_permission: "write",
            user_id: userObject._id.toString(),
            partner_id: dataPartner._id.toString(),
            room_title: roomTitleUser,
            room_image: dataPartner.user_avatar,
            room_type: chatType,
            is_payment: isPayment,
            ref_user: userObject._id.toString(),
          };
          let dataOptionPartner = {
            chat_room_id: dataCreateReturn._id.toString(),
            user_role: dataPartner.user_role ? dataPartner.user_role : "user",
            user_permission: "write",
            user_id: dataPartner._id.toString(),
            partner_id: userObject._id.toString(),
            room_title: roomTitlePartner,
            room_image: userObject.user_avatar,
            room_type: chatType,
            is_payment: 0,
            ref_user: userObject._id.toString(),
          };
          let dataReturnOption = await this.chatRoomUserOptionService.create(dataOptionUser);
          await this.chatRoomUserOptionService.create(dataOptionPartner);
          let dataPartnerObject = {
            _id: dataPartner._id.toString(),
            user_id: dataPartner._id.toString(),
            user_role: dataPartner.user_role,
            user_login: dataPartner.user_login,
            user_avatar: dataPartner.user_avatar,
            user_avatar_thumbnail: dataPartner.user_avatar_thumbnail,
            display_name: dataPartner.display_name,
            last_active: dataPartner.last_active,
          };
          let dataReturnOptionObject = dataReturnOption.toObject();
          let dataToReturn = {
            ...dataReturnOptionObject,
            ...{ chat_room_id: dataCreateReturn.toObject() },
            ...{ partner_id: dataPartnerObject },
          };

          if (process.env.BRANCH_NAME === "masked_chat" && sessionObject) {
            let dataToUpdate = [];
            let dataUpdateSession = [partnerId];
            let oldData = [];
            if (sessionObject?.unset_ids) {
              for (let dataSessionOld of sessionObject.unset_ids) {
                oldData.push(dataSessionOld.toString());
              }
            }
            dataToUpdate = [...oldData, ...dataUpdateSession];

            let afterData: any[] = _.union(dataToUpdate, []);
            let dataSessionToUpdate = {
              _id: sessionObject?._id.toString(),
              unset_ids: afterData,
            };
            await this.userSessionService.update(dataSessionToUpdate);
          }
          return dataToReturn;
        }
      } else {
        let userId = userObject._id.toString();
        //Create Group Room
        let partnerArray = partnerId.split(",");
        if (partnerArray && partnerArray.length >= 2) {
          if (partnerArray.indexOf(userId) !== -1) {
            if (!isReturn) {
              throw new BadRequestException("Can't add yourself into Group!");
            } else {
              return null;
            }
          }
          //Create New Room
          let dataFilterPartner = {
            ids: partnerArray,
          };
          let newPartnerArray = [userId];
          let dataPartner = await this.appUserService.filter(dataFilterPartner, {}, 1, 10000);
          if (!dataPartner || !dataPartner.length) {
            if (!isReturn) {
              throw new BadRequestException("Partner is not exist!");
            } else {
              return null;
            }
          }

          if (dataPartner.length < 2) {
            if (!isReturn) {
              throw new BadRequestException("Partners number is not Enough!");
            } else {
              return null;
            }
          }

          partnerArray.push(userId);

          let groupName = "";
          for (let partnerIndex in dataPartner) {
            newPartnerArray.push(dataPartner[partnerIndex]._id.toString());
            if (Number(partnerIndex) <= 1) {
              let displayName = dataPartner[partnerIndex].display_name
                ? dataPartner[partnerIndex].display_name
                : dataPartner[partnerIndex].user_login;
              groupName = groupName + ", " + displayName;
            }
          }
          if (groupName.length >= 2) {
            groupName = groupName.substring(2);
          }

          let roomTitleUser = groupName;
          let lastMessage = "New group with " + roomTitleUser;
          if (process.env.BRANCH_NAME === "chat_gpt") {
            lastMessage = "New conversation with Chat GPT";
          }

          let dataCreate = {
            user_id: userId,
            room_type: chatType,
            room_limit_number: 100,
            room_private: 1,
            chat_history_count: 1,
            group_partners: newPartnerArray,
            partner_count: newPartnerArray.length,
            room_name: roomName ? roomName : roomTitleUser,
            last_message: lastMessage,
          };

          let dataCreateReturn: any = await this.chatRoomService.create(dataCreate);

          let dataUserReturn = [];
          dataUserReturn.push(await this.handleGetUserBase(userObject));

          //Process Save User & Advisor To Option
          let dataOptionUser = {
            chat_room_id: dataCreateReturn._id.toString(),
            user_role: "admin",
            user_permission: "write",
            room_type: chatType,
            user_id: userObject._id.toString(),
            room_title: "",
            room_image: "",
            chat_history_count: 1,
          };
          let dataRoomUserOption = await this.chatRoomUserOptionService.create(dataOptionUser);

          for (let partnerItem of dataPartner) {
            //Process Save User & Advisor To Option
            let dataOptionUser = {
              chat_room_id: dataCreateReturn._id.toString(),
              user_role: partnerItem.user_role ? partnerItem.user_role : "user",
              user_permission: "write",
              user_id: partnerItem._id.toString(),
              room_title: "",
              room_image: "",
              chat_history_count: 1,
              room_type: chatType,
            };
            await this.chatRoomUserOptionService.create(dataOptionUser);
            dataUserReturn.push(await this.handleGetUserBase(partnerItem));
          }

          let mediaMeta = [
            {
              key: "message",
              value: userObject.display_name + " create new Group!",
            },
          ];

          let dataToCreate = {
            media_url: roomName,
            createBy: userObject._id.toString(),
            media_type: "system_message",
            media_mime_type: "",
            media_file_name: "",
            media_thumbnail: "",
            media_meta: mediaMeta,
            chat_room_id: dataCreateReturn._id.toString(),
            chat_history_id: null,
            media_status: 1,
          };
          let currentTime = new Date();
          let dataMedia = await this.mediaService.create(dataToCreate);
          if (dataMedia) {
            let dataCreate = {
              user_type: "customer",
              parent_id: null,
              chat_room_id: dataCreateReturn._id.toString(),
              chat_content: "",
              chat_type: "",
              chat_status: "send",
              local_id: null,
              createBy: userObject._id.toString(),
              send_at: currentTime.toUTCString(),
              read_at: currentTime.toUTCString(),
              media_ids: [dataMedia._id.toString()],
            };
            await this.chatHistoryService.create(dataCreate);
          }

          dataCreateReturn = {
            ...dataCreateReturn.toObject(),
            ...{
              group_partners: dataUserReturn,
            },
          };

          let dataToReturn = {
            ...dataRoomUserOption.toObject(),
            ...{ group_partners: dataUserReturn, chat_room_id: dataCreateReturn },
          };
          return dataToReturn;
        } else {
          if (!isReturn) {
            throw new BadRequestException("Partners number is not Enough!");
          } else {
            return null;
          }
        }
      }
    } catch (error) {
      if (!isReturn) {
        this.logger.log("handleCreateRoom Error: " + JSON.stringify(error));
        throw new BadRequestException(error.message);
      } else {
        return null;
      }
    }
  }

  async handleGetUserBase(dataPartner: any) {
    return {
      _id: dataPartner?._id.toString(),
      user_id: dataPartner?._id.toString(),
      user_role: dataPartner?.user_role,
      user_login: dataPartner?.user_login,
      user_avatar: dataPartner?.user_avatar,
      user_avatar_thumbnail: dataPartner?.user_avatar_thumbnail,
      display_name: dataPartner?.display_name,
      last_active: dataPartner?.last_active,
    };
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   */
  async removeRoom(id: string, res: Response, req: ExpressRequestDto) {
    //Room ID
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new BadRequestException("Data is invalid");
      }

      let dataPermissionFilter = {
        chat_room_id: id,
        user_id: userObject._id.toString(),
      };
      let dataRoomUserOption = await this.chatRoomUserOptionService.findOneWithId(dataPermissionFilter);

      let dataToUpdate = {
        _id: dataRoomUserOption._id.toString(),
        chat_history_count: 0,
        query_from: dataRoomUserOption.chat_room_id.last_history,
      };
      let dataReturn = await this.chatRoomUserOptionService.update(dataToUpdate);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      this.logger.log("removeRoom Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleViewRoom(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }

      let objectId = new Types.ObjectId(id);
      if (!objectId) {
        throw new BadRequestException("Chat Room ID is invalid (Not is an ObjectID)");
      }
      let dataRoomObject = await this.chatRoomService.findOneRoom({ _id: id });

      let dataPermissionFilter = {
        chat_room_id: id,
        user_id: userObject._id.toString(),
      };
      let dataUpdate = {
        last_view: dataRoomObject.last_history,
        read_count: 0,
      };
      //Update to List
      let dataToUpdate = await this.chatRoomUserOptionService.updateByCondition(dataPermissionFilter, dataUpdate);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataToUpdate);
    } catch (error) {
      this.logger.log("removeRoom Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param userObject
   * @returns
   */

  async handleGetRoomByUser(query: GetChatRoomListDto, userObject: User, res: Response) {
    let page = Number(query?.page) || 1;
    let limit = query?.limit || 20;
    let orderBy = <"ASC" | "DESC">"DESC";
    if (query?.order_by === "ASC" || query?.order_by === "DESC") {
      orderBy = query?.order_by;
    }
    delete query.order_by;
    delete query.limit;
    delete query.page;
    let dataFilter = {
      ...query,
      ...{ user_id: userObject._id.toString() },
    };

    let dataOrder = {
      updatedAt: orderBy,
    };
    let dataChat = null;
    let partnerIds = [];
    let dataToReturn = [];
    let dataCount = 0;
    if (!query?.is_join || query?.is_join === "true") {
      dataChat = await this.chatRoomUserOptionService.filter(dataFilter, dataOrder, page, limit);
      if (dataChat && dataChat.length) {
        for (let dataChatItem of dataChat) {
          let dataToPush = dataChatItem.toObject();
          dataToReturn.push(dataToPush);
          partnerIds.push(dataChatItem?.partner_id?._id?.toString());
        }
      }
      dataCount = await this.chatRoomUserOptionService.count(dataFilter);
    }

    if (query?.is_join && query?.is_join === "false") {
      //Add Chat List
      let dataFilter: any = {
        room_private: 0,
        room_type: "group",
        unset: userObject?._id?.toString(),
      };
      let dataSort: any = {
        numberMember: "DESC",
      };
      let dataRoomToAdd = await this.chatRoomService.filter(dataFilter, dataSort, page, limit);
      for (let dataRoomItem of dataRoomToAdd) {
        let dataToAddNew = {
          chat_room_id: dataRoomItem.toObject(),
          user_permission: "read",
          room_title: "",
          room_type: "group",
          room_image: "",
          query_from: "",
        };
        dataToReturn.push(dataToAddNew);
      }
    }

    if (!query.is_join) {
      if ((dataChat?.length ? dataChat.length : 0) < Number(limit) && query.room_type === "group") {
        let lastPage = page - Math.floor(dataCount / limit);
        if (lastPage >= 1) {
          //Add Chat List
          let dataFilter: any = {
            room_private: 0,
            room_type: "group",
            unset: userObject?._id?.toString(),
          };
          let dataSort: any = {
            numberMember: "DESC",
          };
          let dataRoomToAdd = await this.chatRoomService.filter(dataFilter, dataSort, lastPage, limit);
          for (let dataRoomItem of dataRoomToAdd) {
            let dataToAddNew = {
              chat_room_id: dataRoomItem.toObject(),
              user_permission: "read",
              room_title: "",
              room_type: "group",
              room_image: "",
              query_from: "",
            };
            dataToReturn.push(dataToAddNew);
          }
        }
      }
    }

    let userId = userObject._id.toString();
    //Check Permission
    let dataToFilter = {
      partner_id: userId,
      user_ids: partnerIds,
      match_status: 1,
    };
    let orderByOBject = {};
    let dataUserFollow = await this.userFollowService.filterUser(dataToFilter, orderByOBject, 1, limit, false);
    let dataPartnerFollow = [];
    for (let dataUserFollowItem of dataUserFollow) {
      dataPartnerFollow.push(dataUserFollowItem?.user_id?._id?.toString());
    }

    //Get Data level
    if (query?.channel_id) {
      let dataUserIds = dataToReturn?.map((value) => {
        return value?.partner_id?._id?.toString();
      });
      //get permission
      let dataFilterMember = {
        channel_id: query?.channel_id?.toString(),
        user_ids: dataUserIds,
      };
    }

    let dataReturnFinal = [];
    for (let dataItemProcess of dataToReturn) {
      let partnerId = dataItemProcess?.partner_id?._id?.toString();

      if (dataPartnerFollow.indexOf(partnerId) !== -1) {
        dataReturnFinal.push({ ...dataItemProcess, ...{ is_match: "1" } });
      } else {
        dataReturnFinal.push({ ...dataItemProcess, ...{ is_match: "0" } });
      }
    }

    return res
      .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
      .status(HttpStatus.OK)
      .json(dataReturnFinal);
  }

  /**
   * @author Tony Vu
   * @param query
   * @param userObject
   * @returns
   */

  async handleGetCountReply(query: GetChatRoomListDto, userObject: User, res: Response) {
    delete query.order_by;
    delete query.limit;
    delete query.page;
    let dataFilter = {
      ...query,
      ...{ user_id: userObject._id.toString() },
    };

    let dataCount = await this.chatRoomUserOptionService.count(dataFilter);

    return res
      .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
      .status(HttpStatus.OK)
      .json({ count: dataCount });
  }

  /**
   * @author Tony Vu
   * @param res
   * @param req
   * @param updateChatRoomDto
   * @returns
   */
  async addUserRole(res: Response, req: ExpressRequestDto, updateChatRoomDto: UpdateChatRoomUserRoleDto) {
    try {
      let userObject = req?.user_object;

      if (!userObject) {
        throw new BadRequestException("User is not found!");
      }

      //Get Room Option
      let dataToFilter = {
        user_id: userObject._id.toString(),
        chat_room_id: updateChatRoomDto.chat_room_id,
      };
      let dataUserOption = await this.chatRoomUserOptionService.findOne(dataToFilter);
      if (!dataUserOption) {
        throw new BadRequestException("You not in Room!");
      }
      if (updateChatRoomDto.role === "admin" && dataUserOption && dataUserOption.user_role !== "admin") {
        throw new BadRequestException("You not have permission for this action!");
      }
      if (dataUserOption.chat_room_id.room_type !== "group") {
        throw new BadRequestException("Room is not Group type!");
      }

      let partnerArray = [];
      let userId = updateChatRoomDto.user_id;
      if (userId.indexOf(",") !== -1) {
        partnerArray = userId.split(",");
      } else {
        partnerArray.push(updateChatRoomDto.user_id);
      }
      let oldPartner = dataUserOption.chat_room_id?.group_partners;

      for (let partnerItem of partnerArray) {
        if (oldPartner.indexOf(partnerItem) !== -1) {
          throw new BadRequestException("User " + partnerItem + " is Exist in Room!");
        }
      }
      //Create New Room
      let dataFilterPartner = {
        ids: partnerArray,
      };
      let dataPartner = await this.appUserService.filter(dataFilterPartner, {}, 1, 10000);
      let dataReturn = [];

      if (dataPartner && dataPartner.length) {
        for (let partnerItem of dataPartner) {
          dataReturn.push(await this.handleGetUserBase(partnerItem));
        }
        let userRole = updateChatRoomDto.role;
        await this.handleUpdateUserRole(
          dataPartner,
          updateChatRoomDto.chat_room_id,
          userRole,
          updateChatRoomDto.user_permission,
          dataUserOption.chat_room_id
        );
        let dataToReturn = {
          group_partners: dataReturn,
        };
        return res.set({ "Access-Control-Expose-Headers": "X-Authorization" }).status(HttpStatus.OK).json(dataToReturn);
      } else {
        throw new BadRequestException("Not found partner!");
      }
    } catch (error) {
      this.logger.log("addUserRole Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  /**
   *
   * @param dataPartner
   * @param roomId
   * @param userRole
   * @param addUser
   * @param roomObject
   * @returns
   */
  async handleUpdateUserRole(
    dataPartner: User[],
    roomId: string,
    userRole: string,
    userPermission: string,
    roomObject: ChatRoom
  ) {
    let dataPartnerToAdd = [];
    for (let userItem of dataPartner) {
      dataPartnerToAdd.push(userItem._id.toString());
    }
    for (let partnerItem of dataPartner) {
      //Get Room Option
      let dataToFilter = {
        user_id: partnerItem._id.toString(),
        chat_room_id: roomId,
      };
      let roomUserObject = await this.chatRoomUserOptionService.findOne(dataToFilter);
      if (roomUserObject) {
        throw new BadRequestException("User role have exist in this Room!");
      } else {
        //Process Save User & Advisor To Option
        let dataOptionUser = {
          chat_room_id: roomId,
          user_role: userRole,
          user_permission: userPermission,
          user_id: partnerItem._id.toString(),
          group_partners: dataPartnerToAdd,
          room_title: "",
          room_image: "",
          room_type: "group",
        };
        await this.chatRoomUserOptionService.create(dataOptionUser);
      }
    }
    //Update Room Data
    let newGroupPartner = [...roomObject.group_partners, ...dataPartnerToAdd];
    let dataToUpdate = {
      _id: roomObject._id.toString(),
      group_partners: newGroupPartner,
      partner_count: newGroupPartner.length,
    };
    await this.chatRoomService.update(dataToUpdate);
    return true;
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   */
  async handleUpdateRoom(res: Response, req: ExpressRequestDto, dataUpdate: UpdateChatRoomUserDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is not invalid");
      }
      let dataToFilter = {
        user_id: userObject._id.toString(),
        chat_room_id: dataUpdate._id.toString(),
      };
      let roomUserObject = await this.chatRoomUserOptionService.findOne(dataToFilter);

      if (!roomUserObject) {
        throw new BadRequestException("You not in Room!");
      }
      let mediaObject = null;
      if (dataUpdate.room_image) {
        mediaObject = await this.mediaService.findById(dataUpdate.room_image);
        if (!mediaObject) {
          throw new BadRequestException("Media not Exist");
        }
        mediaObject = mediaObject.toObject();
      }

      if (roomUserObject.chat_room_id.room_type !== "group") {
        throw new BadRequestException("Can't update this Room, because this Room is not Group!");
      }
      let objectId = new Types.ObjectId(dataUpdate.room_image);
      if (!objectId) {
        throw new BadRequestException("Room Media is invalid (Not is an ObjectID)");
      }

      let dataUpdateReturn = await this.chatRoomService.update(dataUpdate);
      let newDataReturn = { ...dataUpdateReturn.toObject(), ...{ room_image: mediaObject } };
      return res.set({ "Access-Control-Expose-Headers": "X-Authorization" }).status(HttpStatus.OK).json(newDataReturn);
    } catch (error) {
      this.logger.log("findMemberByRoom Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   */
  async handleUpdateRoomOption(res: Response, req: ExpressRequestDto, dataUpdate: UpdateChatRoomUserDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is not invalid");
      }
      let dataToFilter = {
        user_id: userObject._id.toString(),
        chat_room_id: dataUpdate._id.toString(),
      };
      let roomUserObject = await this.chatRoomUserOptionService.findOne(dataToFilter);

      if (!roomUserObject) {
        throw new BadRequestException("You not in Room!");
      }

      let dataNewToUpdate = {
        _id: roomUserObject._id,
        mute_status: Number(dataUpdate.mute_status),
      };
      let dataUpdateReturn = await this.chatRoomUserOptionService.update(dataNewToUpdate);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization" })
        .status(HttpStatus.OK)
        .json(dataUpdateReturn);
    } catch (error) {
      this.logger.log("findMemberByRoom Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  /**
   *
   * @param res
   * @param req
   * @param deleteChatRoomDto
   * @returns
   */
  async removeUserRole(res: Response, req: ExpressRequestDto, deleteChatRoomDto: DeleteChatRoomUserRoleDto) {
    try {
      let userObject = req?.user_object;

      if (!userObject) {
        throw new BadRequestException("User is not found!");
      }

      //Get Room Option
      let dataToFilter = {
        user_id: deleteChatRoomDto.user_id,
        chat_room_id: deleteChatRoomDto.chat_room_id,
      };
      let dataUserOption = await this.chatRoomUserOptionService.findOne(dataToFilter);
      if (!dataUserOption) {
        throw new BadRequestException("You is not in Room!");
      }
      if (
        dataUserOption &&
        dataUserOption.user_role !== "admin" &&
        userObject._id.toString() !== deleteChatRoomDto.user_id
      ) {
        throw new BadRequestException("You not have permission for this action!");
      }
      if (dataUserOption.chat_room_id.room_type !== "group") {
        throw new BadRequestException("Room is not Group type!");
      }
      await this.chatRoomUserOptionService.remove(dataUserOption._id.toString());

      let userToSet = await this.appUserService.findById(deleteChatRoomDto.user_id, {});

      let totalMember = await this.chatRoomUserOptionService.filterWithUserObject(
        { chat_room_id: deleteChatRoomDto.chat_room_id },
        {}
      );
      let haveAdmin = false;
      if (totalMember && totalMember.length) {
        for (let memberItem of totalMember) {
          if (memberItem.user_role === "admin") {
            haveAdmin = true;
          }
        }
        if (!haveAdmin) {
          //Update new Admin
          let dataUpdate = {
            user_id: totalMember[0]?.user_id?._id.toString(),
            chat_room_id: deleteChatRoomDto.chat_room_id,
            user_role: "admin",
          };

          await this.chatRoomUserOptionService.update(dataUpdate);
          let newMessage = "Set " + totalMember[0].user_id.display_name + " to Admin!";
          await this.setSystemMessage(
            newMessage,
            userToSet,
            deleteChatRoomDto.chat_room_id,
            dataUserOption.chat_room_id.room_name,
            req,
            res
          );
        }
      }

      //Update Partner Group
      let userGroupOld = dataUserOption.chat_room_id.group_partners;
      userGroupOld = userGroupOld.filter((value: any, index: number) => {
        if (value?.toString() === deleteChatRoomDto.user_id) {
          return false;
        } else {
          return true;
        }
      });
      let dataToUpdate = {
        _id: dataUserOption.chat_room_id._id.toString(),
        group_partners: userGroupOld,
        partner_count: userGroupOld.length,
      };
      await this.chatRoomService.update(dataToUpdate);

      let newMessage = userToSet?.display_name + " leave";
      await this.setSystemMessage(
        newMessage,
        userToSet,
        deleteChatRoomDto.chat_room_id,
        dataUserOption.chat_room_id.room_name,
        req,
        res
      );

      //Un-join Topic
      if (process.env.BRANCH_NAME === "masked_chat") {
        let dataToAdd: string[] = [];
        dataToAdd = _.sample(dataToAdd);
        //Update User
        let dataToUpdate = {
          _id: userToSet._id?.toString(),
          join_topics: dataToAdd,
        };

        await this.appUserService.update(dataToUpdate);
      }

      return res.set({ "Access-Control-Expose-Headers": "X-Authorization" }).status(HttpStatus.OK).json({
        chat_room_option_id: dataUserOption._id.toString(),
        status: "successfully",
      });
    } catch (error) {
      this.logger.log("removeUserRole Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  async setSystemMessage(message: string, userObject: User, chatRoomId: string, roomName: string, req: any, res: any) {
    let mediaMeta = [
      {
        key: "message",
        value: message,
      },
    ];

    let dataToCreate = {
      media_url: roomName,
      createBy: userObject._id.toString(),
      media_type: "system_message",
      media_mime_type: "",
      media_file_name: "",
      media_thumbnail: "",
      media_meta: mediaMeta,
      chat_room_id: chatRoomId,
      chat_history_id: null,
      media_status: 1,
    };
    let currentTime = new Date();
    let dataMedia = await this.mediaService.create(dataToCreate);

    if (!dataMedia) {
      return false;
    }

    let createChatHistoryDto = {
      chat_room_id: chatRoomId,
      chat_content: "",
      media_data: JSON.stringify([dataMedia._id.toString()]),
    };

    let dataReturnHistory: any = await this.chatHistoryHelper.createNewHistory(
      req,
      res,
      createChatHistoryDto,
      false,
      false
    );

    return true;
  }

  /**
   *
   * @param res
   * @param req
   * @param query
   */
  async getSameGroup(req: ExpressRequestDto, res: Response, query: GetSameGroupDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is not invalid");
      }
      let page = Number(query?.page) || 1;
      let limit = query?.limit || 20;
      let orderBy = <"ASC" | "DESC">"DESC";
      if (query?.order_by === "ASC" || query?.order_by === "DESC") {
        orderBy = query?.order_by;
      }
      delete query.order_by;
      delete query.limit;
      delete query.page;
      let dataFilter = {
        ...query,
        ...{ group_partners: [userObject._id.toString(), query.partner_id] },
      };

      let dataOrder = {
        updatedAt: orderBy,
      };
      let dataChat = await this.chatRoomService.filter(dataFilter, dataOrder, page, limit);
      let dataCount = await this.chatRoomService.count(dataFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataChat);
    } catch (error) {
      this.logger.log("findMemberByRoom Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  /**
   *
   * @param id
   * @param req
   * @param res
   */
  async handleJoinGroup(ids: string[], res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;

      if (!userObject) {
        throw new BadRequestException("User is not found!");
      }
      let dataRoomObjectUpdate = [];
      for (let id of ids) {
        //Get Room Option
        let dataToFilter = {
          user_id: userObject._id.toString(),
          chat_room_id: id,
        };
        let dataUserOption = await this.chatRoomUserOptionService.findOne(dataToFilter);
        //Get Room ID
        let dataRoomObject = await this.chatRoomService.findOneRoom({ _id: id });

        //Join Topic
        if (process.env.BRANCH_NAME === "masked_chat") {
          let dataToAdd: string[] = [];

          dataToAdd = _.sample(dataToAdd);
          //Update User
          let dataToUpdate = {
            _id: userObject._id?.toString(),
            join_topics: dataToAdd,
          };
          await this.appUserService.update(dataToUpdate);
        }

        if (dataUserOption) {
          let dataReturn = {
            ...dataUserOption?.toObject(),
            ...{
              chat_room_id: dataRoomObject,
            },
          };
          dataRoomObjectUpdate.push(dataReturn);
          //return res.set({ "Access-Control-Expose-Headers": "X-Authorization" }).status(HttpStatus.OK).json(dataReturn);
          continue;
        }
        // if (dataUserOption.chat_room_id.room_type !== "group") {
        //   throw new BadRequestException("Room is not Group type!");
        // }

        if (dataRoomObject?.room_type !== "group") {
          throw new BadRequestException("Room is not Group type!");
        }

        if (Number(dataRoomObject?.room_private) !== 0) {
          throw new BadRequestException("Room is not for Public!");
        }

        let partnerArray = [];
        let userId = userObject._id.toString();
        partnerArray.push(userId);
        let oldPartner = dataRoomObject?.group_partners;

        // for (let partnerItem of partnerArray) {
        //   if (oldPartner.indexOf(partnerItem) !== -1) {
        //     throw new BadRequestException("User " + partnerItem + " is Exist in Room!");
        //   }
        // }
        //let dataArray = [...oldPartner, ...partnerArray];

        let dataArray = _.union(oldPartner, partnerArray);

        let userRole = "user";

        //Process Save User & Advisor To Option
        let dataOptionUser = {
          chat_room_id: id,
          user_role: userRole,
          user_permission: "write",
          user_id: userId,
          room_title: "",
          room_image: "",
          room_type: "group",
        };
        let dataUserOptionObject = await this.chatRoomUserOptionService.create(dataOptionUser);
        let dataToUpdate = {
          _id: id,
          group_partners: dataArray,
          partner_count: dataArray.length,
        };
        let dataRoomObjectUpdateNew: any = await this.chatRoomService.update(dataToUpdate);
        dataRoomObjectUpdateNew = {
          ...dataUserOptionObject.toObject(),
          ...{ chat_room_id: dataUserOptionObject.toObject() },
        };
        dataRoomObjectUpdate.push(dataRoomObjectUpdateNew);

        let newMessage = userObject?.display_name + " join Group";
        await this.setSystemMessage(newMessage, userObject, id, dataUserOptionObject.room_title, req, res);
      }

      if (dataRoomObjectUpdate?.length === 1) {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization" })
          .status(HttpStatus.OK)
          .json(dataRoomObjectUpdate[0]);
      } else {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization" })
          .status(HttpStatus.OK)
          .json(dataRoomObjectUpdate);
      }
    } catch (error) {
      this.logger.log("findMemberByRoom Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }
}
