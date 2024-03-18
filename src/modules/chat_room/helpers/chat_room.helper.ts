import { BadRequestException, HttpStatus, Injectable, Logger, NotFoundException } from "@nestjs/common";
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
import { FindChatRoomDto, GetChatRoomListDto } from "../dto/get-chat_room_list.dto";
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
    chatType: "personal" | "group" | "anonymous" | "class",
    roomName: string = "",
    isReturn: boolean = false,
    req: ExpressRequestDto = null,
    isClassRoom: boolean = false,
    classRoomLimitMember: number = 20
  ) {
    try {
      if (chatType === "personal" || chatType === "anonymous") {
        let sessionObject = null;
        let authCode = null;
        if (req) {
          sessionObject = req?.session_data;
          authCode = req?.auth_code;
        }
        const userId = userObject._id.toString();
        //Check Chat Room
        const dataToFind = {
          user_id: userId,
          partner_id: partnerId,
          room_type: chatType,
        };
        const dataRoomUserOption = await this.chatRoomUserOptionService.findOne(dataToFind);
        if (dataRoomUserOption) {
          const dataToReturn = dataRoomUserOption.toObject();
          return dataToReturn;
        } else {
          const dataPartner = await this.appUserService.findById(partnerId, {});
          if (!dataPartner || !Number(dataPartner.user_status)) {
            if (!isReturn) {
              throw new BadRequestException("Partner is not exist!");
            } else {
              return null;
            }
          }

          const roomTitleUser = dataPartner?.display_name ? dataPartner?.display_name : dataPartner?.user_login;
          const roomTitlePartner = userObject?.display_name ? userObject?.display_name : userObject?.user_login;

          const dataCreate = {
            user_id: userId,
            room_type: chatType,
            room_limit_number: 100,
            room_private: 1,
            chat_history_count: 0,
            last_message: "Send message to " + roomTitleUser,
          };

          const dataCreateReturn = await this.chatRoomService.create(dataCreate);
          //Process Save User & Advisor To Option
          const dataOptionUser = {
            chat_room_id: dataCreateReturn._id.toString(),
            user_role: userObject.user_role ? userObject.user_role : "user",
            user_permission: "write",
            user_id: userObject._id.toString(),
            partner_id: dataPartner._id.toString(),
            room_title: roomTitleUser,
            room_image: dataPartner.user_avatar,
            room_type: chatType,
            ref_user: userObject._id.toString(),
          };
          const dataOptionPartner = {
            chat_room_id: dataCreateReturn._id.toString(),
            user_role: dataPartner.user_role ? dataPartner.user_role : "user",
            user_permission: "write",
            user_id: dataPartner._id.toString(),
            partner_id: userObject._id.toString(),
            room_title: roomTitlePartner,
            room_image: userObject.user_avatar,
            room_type: chatType,
            ref_user: userObject._id.toString(),
          };
          const dataReturnOption = await this.chatRoomUserOptionService.create(dataOptionUser);
          await this.chatRoomUserOptionService.create(dataOptionPartner);
          const dataPartnerObject = {
            _id: dataPartner._id.toString(),
            user_id: dataPartner._id.toString(),
            user_role: dataPartner.user_role,
            user_login: dataPartner.user_login,
            user_avatar: dataPartner.user_avatar,
            user_avatar_thumbnail: dataPartner.user_avatar_thumbnail,
            display_name: dataPartner.display_name,
            last_active: dataPartner.last_active,
            official_status: dataPartner.official_status,
          };
          const dataReturnOptionObject = dataReturnOption.toObject();
          const dataToReturn = {
            ...dataReturnOptionObject,
            ...{ chat_room_id: dataCreateReturn.toObject() },
            ...{ partner_id: dataPartnerObject },
          };

          if (process.env.BRANCH_NAME === "masked_chat" && sessionObject) {
            let dataToUpdate = [];
            const dataUpdateSession = [partnerId];
            const oldData = [];
            if (sessionObject?.unset_ids) {
              for (const dataSessionOld of sessionObject.unset_ids) {
                oldData.push(dataSessionOld.toString());
              }
            }
            dataToUpdate = [...oldData, ...dataUpdateSession];

            const afterData: any[] = _.union(dataToUpdate, []);
            const dataSessionToUpdate = {
              _id: sessionObject?._id.toString(),
              unset_ids: afterData,
            };
            await this.userSessionService.update(dataSessionToUpdate);
          }
          return dataToReturn;
        }
      } else {
        const userId = userObject._id.toString();
        //Create Group Room
        const partnerArray = partnerId === "" ? [] : partnerId.split(",");
        if (partnerArray.indexOf(userId) !== -1) {
          if (!isReturn) {
            throw new BadRequestException("Can't add yourself into Group!");
          } else {
            return null;
          }
        }
        //Create New Room
        const dataFilterPartner = {
          ids: partnerArray,
        };
        const newPartnerArray = [userId];
        const dataPartner = await this.appUserService.filter(dataFilterPartner, {}, 1, 10000);

        partnerArray.push(userId);

        let groupName = "";
        for (const partnerIndex in dataPartner) {
          newPartnerArray.push(dataPartner[partnerIndex]._id.toString());
          if (Number(partnerIndex) <= 1) {
            const displayName = dataPartner[partnerIndex].display_name
              ? dataPartner[partnerIndex].display_name
              : dataPartner[partnerIndex].user_login;
            groupName = groupName + ", " + displayName;
          }
        }
        if (groupName.length >= 2) {
          groupName = groupName.substring(2);
        }

        const roomTitleUser = groupName;
        let lastMessage = "New group with " + roomTitleUser;
        if (process.env.BRANCH_NAME === "chat_gpt") {
          lastMessage = "New conversation with Chat GPT";
        }

        const dataCreate = {
          user_id: userId,
          room_type: chatType,
          room_limit_number: isClassRoom ? classRoomLimitMember : 100,
          room_private: 1,
          chat_history_count: 1,
          group_partners: newPartnerArray,
          partner_count: newPartnerArray.length,
          room_name: roomName ? roomName : roomTitleUser,
          last_message: isClassRoom ? `New group ${roomName}` : lastMessage,
        };

        let dataCreateReturn: any = await this.chatRoomService.create(dataCreate);

        const dataUserReturn = [];
        dataUserReturn.push(await this.handleGetUserBase(userObject));

        //Process Save User & Advisor To Option
        const dataOptionUser = {
          chat_room_id: dataCreateReturn._id.toString(),
          user_role: "admin",
          user_permission: "write",
          room_type: chatType,
          user_id: userObject._id.toString(),
          room_title: "",
          room_image: "",
          chat_history_count: 1,
        };
        const dataRoomUserOption = await this.chatRoomUserOptionService.create(dataOptionUser);

        for (const partnerItem of dataPartner) {
          //Process Save User & Advisor To Option
          const dataOptionUser = {
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

        const mediaMeta = [
          {
            key: "message",
            value: userObject.display_name + " create new Group!",
          },
        ];

        const dataToCreate = {
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
        const currentTime = new Date();
        const dataMedia = await this.mediaService.create(dataToCreate);
        if (dataMedia) {
          const dataCreate = {
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

        const dataToReturn = {
          ...dataRoomUserOption.toObject(),
          ...{ group_partners: dataUserReturn, chat_room_id: dataCreateReturn },
        };
        return dataToReturn;
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
      official_status: dataPartner?.official_status,
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
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new BadRequestException("Data is invalid");
      }

      const dataPermissionFilter = {
        chat_room_id: id,
        user_id: userObject._id.toString(),
      };
      const dataRoomUserOption = await this.chatRoomUserOptionService.findOneWithId(dataPermissionFilter);

      const dataToUpdate = {
        _id: dataRoomUserOption._id.toString(),
        chat_history_count: 0,
        query_from: dataRoomUserOption.chat_room_id.last_history,
      };
      const dataReturn = await this.chatRoomUserOptionService.update(dataToUpdate);
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
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }

      const objectId = new Types.ObjectId(id);
      if (!objectId) {
        throw new BadRequestException("Chat Room ID is invalid (Not is an ObjectID)");
      }
      const dataRoomObject = await this.chatRoomService.findOneRoom({ _id: id });

      const dataPermissionFilter = {
        chat_room_id: id,
        user_id: userObject._id.toString(),
      };
      const dataUpdate = {
        last_view: dataRoomObject.last_history,
        read_count: 0,
      };
      //Update to List
      const dataToUpdate = await this.chatRoomUserOptionService.updateByCondition(dataPermissionFilter, dataUpdate);
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
    const page = Number(query?.page) || 1;
    const limit = query?.limit || 20;
    let orderBy = <"ASC" | "DESC">"DESC";
    if (query?.order_by === "ASC" || query?.order_by === "DESC") {
      orderBy = query?.order_by;
    }
    delete query.order_by;
    delete query.limit;
    delete query.page;
    const dataFilter = {
      ...query,
      ...{ user_id: userObject._id.toString() },
      ...{ blocked_user: userObject.block_users },
    };
    const dataOrder = {
      updatedAt: orderBy,
    };

    const partnerIds = [];
    const dataToReturn = [];

    const dataChat = await this.chatRoomUserOptionService.filter(dataFilter, dataOrder, page, limit);
    if (dataChat && dataChat.length) {
      for (const dataChatItem of dataChat) {
        const dataToPush = dataChatItem.toObject();
        dataToReturn.push(dataToPush);
        partnerIds.push(dataChatItem?.partner_id?._id?.toString());
      }
    }

    const dataToFilter = {
      partner_id: userObject._id.toString(),
      user_ids: partnerIds,
      match_status: 1,
    };
    const orderByOBject = {};
    const dataUserFollow = await this.userFollowService.filterUser(dataToFilter, orderByOBject, 1, limit, false);
    const dataPartnerFollow = [];
    for (const dataUserFollowItem of dataUserFollow) {
      dataPartnerFollow.push(dataUserFollowItem?.user_id?._id?.toString());
    }

    let dataReturnFinal = [];
    for (const dataItemProcess of dataToReturn) {
      const partnerId = dataItemProcess?.partner_id?._id?.toString();

      // should display name of personal chat room to partner's name
      if (dataItemProcess.room_type === "personal") {
        dataItemProcess.chat_room_id.room_name = dataItemProcess.partner_id?.display_name || "";
      }

      if (dataPartnerFollow.indexOf(partnerId) !== -1) {
        dataReturnFinal.push({ ...dataItemProcess, ...{ is_match: "1" } });
      } else {
        dataReturnFinal.push({ ...dataItemProcess, ...{ is_match: "0" } });
      }
    }

    // filter by room name
    if (query.search) {
      dataReturnFinal = dataReturnFinal.filter((room) => {
        return room.chat_room_id.room_name.toLowerCase().search(query.search.toLowerCase()) >= 0;
      });
    }

    return res
      .set({
        "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
        "X-Total-Count": dataReturnFinal.length,
      })
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
    const dataFilter = {
      ...query,
      ...{ user_id: userObject._id.toString() },
    };

    const dataCount = await this.chatRoomUserOptionService.count(dataFilter);

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
      const userObject = req?.user_object;

      const partnerArray = updateChatRoomDto.user_id.split(",");
      const chatroomContainer = updateChatRoomDto.chat_room_id.split(",");

      //Get Room Option
      const dataToFilter = {
        chat_room_id: {
          $in: chatroomContainer,
        },
      };
      if (userObject) dataToFilter["user_id"] = userObject._id.toString();

      const dataUserOption = await this.chatRoomUserOptionService.findAllChatRoom(dataToFilter);
      const dataReturn = [];

      for (const datum of dataUserOption) {
        const chatRoomId = datum.chat_room_id._id.toString();
        if (!datum) {
          throw new BadRequestException("You not in Room! " + chatRoomId);
        }

        if (datum.chat_room_id.room_private === 1 && datum && datum.user_role !== "admin") {
          throw new BadRequestException("You not have permission for this action! " + chatRoomId);
        }

        if (datum.chat_room_id.room_type !== "group") {
          throw new BadRequestException("Room is not Group type! " + chatRoomId);
        }

        const oldPartnerIds = datum.chat_room_id?.group_partners.map((partner) => partner._id.toString());

        for (const partnerItem of partnerArray) {
          if (oldPartnerIds.indexOf(partnerItem) !== -1) {
            throw new BadRequestException("User " + partnerItem + " is Exist in Room! " + chatRoomId);
          }
        }
        //Create New Room
        const dataFilterPartner = {
          ids: partnerArray,
        };
        const dataPartner = await this.appUserService.filter(dataFilterPartner, {}, 1, 10000);

        if (dataPartner && dataPartner.length) {
          for (const partnerItem of dataPartner) {
            dataReturn.push({ ...(await this.handleGetUserBase(partnerItem)), chat_room_id: chatRoomId });
          }
          const userRole = updateChatRoomDto.role;
          await this.handleUpdateUserRole(
            dataPartner,
            chatRoomId,
            userRole,
            updateChatRoomDto.user_permission,
            // @ts-ignore
            datum.chat_room_id,
            updateChatRoomDto.room_type
          );
        } else {
          throw new BadRequestException(`Failed to add user to room ${datum._id}`);
        }
      }

      // this used to ignore response
      // course.helper.ts/addMemberToClass
      if (res) {
        return res.set({ "Access-Control-Expose-Headers": "X-Authorization" }).status(HttpStatus.OK).json(dataReturn);
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
    roomObject: ChatRoom,
    roomType: string = "group"
  ) {
    const dataPartnerToAdd = [];
    for (const userItem of dataPartner) {
      dataPartnerToAdd.push(userItem._id);
    }
    for (const partnerItem of dataPartner) {
      //Get Room Option
      const dataToFilter = {
        user_id: partnerItem._id.toString(),
        chat_room_id: roomId,
      };
      const roomUserObject = await this.chatRoomUserOptionService.findOne(dataToFilter);
      if (roomUserObject) {
        throw new BadRequestException(`User role have exist in this Room! ${roomId}`);
      } else {
        //Process Save User & Advisor To Option
        const dataOptionUser = {
          chat_room_id: roomId,
          user_role: userRole,
          user_permission: userPermission,
          user_id: partnerItem._id.toString(),
          group_partners: dataPartnerToAdd,
          room_title: "",
          room_image: "",
          room_type: roomType,
        };
        await this.chatRoomUserOptionService.create(dataOptionUser);
      }
    }
    //Update Room Data
    const newGroupPartner = [...roomObject.group_partners, ...dataPartnerToAdd];
    const dataToUpdate = {
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
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is not invalid");
      }
      const dataToFilter = {
        user_id: userObject._id.toString(),
        chat_room_id: dataUpdate._id.toString(),
      };
      const roomUserObject = await this.chatRoomUserOptionService.findOne(dataToFilter);

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
      const objectId = new Types.ObjectId(dataUpdate.room_image);
      if (!objectId) {
        throw new BadRequestException("Room Media is invalid (Not is an ObjectID)");
      }

      const dataUpdateReturn = await this.chatRoomService.update(dataUpdate);
      const newDataReturn = { ...dataUpdateReturn.toObject(), ...{ room_image: mediaObject } };
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
      const dataToFilter = {
        _id: dataUpdate._id.toString(),
      };
      const roomUserObject = await this.chatRoomUserOptionService.findOne(dataToFilter);

      if (!roomUserObject) {
        throw new BadRequestException("You not in Room!");
      }

      const dataNewToUpdate = {
        mute_status: dataUpdate.mute_status ? Number(dataUpdate.mute_status) : undefined,
        room_title: dataUpdate.room_name,
        ...dataUpdate,
      };
      const dataUpdateReturn = await this.chatRoomUserOptionService.update(dataNewToUpdate);
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
      const userObject = req?.user_object;

      if (!userObject) {
        throw new BadRequestException("User is not found!");
      }

      //Get Room Option
      const dataToFilter = {
        user_id: deleteChatRoomDto.user_id,
        chat_room_id: deleteChatRoomDto.chat_room_id,
      };
      const dataUserOption = await this.chatRoomUserOptionService.findOne(dataToFilter);

      const _dataToFilter = {
        user_id: userObject._id.toString(),
        chat_room_id: deleteChatRoomDto.chat_room_id,
      };
      const dataUserDoActionOption = await this.chatRoomUserOptionService.findOne(_dataToFilter);

      if (!dataUserOption) {
        throw new BadRequestException("You are not in Room!");
      }
      if (
        dataUserOption &&
        dataUserDoActionOption &&
        dataUserDoActionOption.user_role !== "admin" &&
        dataUserOption.user_role !== "admin" &&
        userObject._id.toString() !== deleteChatRoomDto.user_id
      ) {
        throw new BadRequestException("You not have permission for this action!");
      }
      if (dataUserOption.chat_room_id.room_type !== "group") {
        throw new BadRequestException("Room is not Group type!");
      }
      await this.chatRoomUserOptionService.remove(dataUserOption._id.toString());

      const userToSet = await this.appUserService.findById(deleteChatRoomDto.user_id, {});

      const totalMember = await this.chatRoomUserOptionService.filterWithUserObject(
        { chat_room_id: deleteChatRoomDto.chat_room_id },
        {}
      );
      let haveAdmin = false;
      if (totalMember && totalMember.length) {
        for (const memberItem of totalMember) {
          if (memberItem.user_role === "admin") {
            haveAdmin = true;
          }
        }
        if (!haveAdmin) {
          //Update new Admin
          const dataUpdate = {
            user_id: totalMember[0]?.user_id?._id.toString(),
            chat_room_id: deleteChatRoomDto.chat_room_id,
            user_role: "admin",
          };

          await this.chatRoomUserOptionService.update(dataUpdate);
          const newMessage = "Set " + totalMember[0].user_id.display_name + " to Admin!";
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
        if (value?._id.toString() === deleteChatRoomDto.user_id) {
          return false;
        } else {
          return true;
        }
      });
      const dataToUpdate = {
        _id: dataUserOption.chat_room_id._id.toString(),
        group_partners: userGroupOld,
        partner_count: userGroupOld.length,
      };
      await this.chatRoomService.update(dataToUpdate);

      const newMessage = userToSet?.display_name + " leave";
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
        const dataToUpdate = {
          _id: userToSet._id?.toString(),
          join_topics: dataToAdd,
        };

        await this.appUserService.update(dataToUpdate);
      }

      // this used to ignore response
      // course.helper.ts/removeMemberFromClass
      if (res) {
        return res.set({ "Access-Control-Expose-Headers": "X-Authorization" }).status(HttpStatus.OK).json({
          chat_room_option_id: dataUserOption._id.toString(),
          status: "successfully",
        });
      }
    } catch (error) {
      this.logger.log("removeUserRole Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  async setSystemMessage(message: string, userObject: User, chatRoomId: string, roomName: string, req: any, res: any) {
    const mediaMeta = [
      {
        key: "message",
        value: message,
      },
    ];

    const dataToCreate = {
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
    const currentTime = new Date();
    const dataMedia = await this.mediaService.create(dataToCreate);

    if (!dataMedia) {
      return false;
    }

    const createChatHistoryDto = {
      chat_room_id: chatRoomId,
      chat_content: "",
      media_data: JSON.stringify([dataMedia._id.toString()]),
    };

    const dataReturnHistory: any = await this.chatHistoryHelper.createNewHistory(
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
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is not invalid");
      }
      const page = Number(query?.page) || 1;
      const limit = query?.limit || 20;
      let orderBy = <"ASC" | "DESC">"DESC";
      if (query?.order_by === "ASC" || query?.order_by === "DESC") {
        orderBy = query?.order_by;
      }
      delete query.order_by;
      delete query.limit;
      delete query.page;
      const dataFilter = {
        ...query,
        ...{ group_partners: [userObject._id.toString(), query.partner_id] },
      };

      const dataOrder = {
        updatedAt: orderBy,
      };
      const dataChat = await this.chatRoomService.filter(dataFilter, dataOrder, page, limit);
      const dataCount = await this.chatRoomService.count(dataFilter);
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
      const userObject = req?.user_object;

      if (!userObject) {
        throw new BadRequestException("User is not found!");
      }
      const dataRoomObjectUpdate = [];
      for (const id of ids) {
        //Get Room Option
        const dataToFilter = {
          user_id: userObject._id.toString(),
          chat_room_id: id,
        };
        const dataUserOption = await this.chatRoomUserOptionService.findOne(dataToFilter);
        //Get Room ID
        const dataRoomObject = await this.chatRoomService.findOneRoom({ _id: id });

        //Join Topic
        if (process.env.BRANCH_NAME === "masked_chat") {
          let dataToAdd: string[] = [];

          dataToAdd = _.sample(dataToAdd);
          //Update User
          const dataToUpdate = {
            _id: userObject._id?.toString(),
            join_topics: dataToAdd,
          };
          await this.appUserService.update(dataToUpdate);
        }

        if (dataUserOption) {
          const dataReturn = {
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

        const partnerArray = [];
        const userId = userObject._id.toString();
        partnerArray.push(userId);
        const oldPartner = dataRoomObject?.group_partners;

        // for (let partnerItem of partnerArray) {
        //   if (oldPartner.indexOf(partnerItem) !== -1) {
        //     throw new BadRequestException("User " + partnerItem + " is Exist in Room!");
        //   }
        // }
        //let dataArray = [...oldPartner, ...partnerArray];

        const dataArray = _.union(oldPartner, partnerArray);

        const userRole = "user";

        //Process Save User & Advisor To Option
        const dataOptionUser = {
          chat_room_id: id,
          user_role: userRole,
          user_permission: "write",
          user_id: userId,
          room_title: "",
          room_image: "",
          room_type: "group",
        };
        const dataUserOptionObject = await this.chatRoomUserOptionService.create(dataOptionUser);
        const dataToUpdate = {
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

        const newMessage = userObject?.display_name + " join Group";
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

  async findChatRoom(query: FindChatRoomDto, req: ExpressRequestDto, res: Response) {
    try {
      const chatRoom = await this.chatRoomUserOptionService.findOne({
        user_id: query.user_id,
        partner_id: query.partner_id,
      });
      if (!chatRoom) throw new NotFoundException("Not found chatroom");

      return res.set({ "Access-Control-Expose-Headers": "X-Authorization" }).status(HttpStatus.OK).json(chatRoom);
    } catch (error) {
      this.logger.log("findMemberByRoom Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }
}
