import { BadRequestException, HttpStatus, Injectable, Logger, NotAcceptableException } from "@nestjs/common";
import axios from "axios";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { ChatRoomService } from "../../../modules/chat_room/services/chat_room.service";
import { ChatRoomUserOptionService } from "../../../modules/chat_room/services/chat_room_user_option.service";
import { MediaService } from "../../../modules/media/services/media.service";
import { NotificationHelper } from "../../../modules/notification/helper/notification.helper";
import { User } from "../../../modules/user/schemas/user.schema";
import { UserService } from "../../user/services/user.service";
import { CreateChatHistoryWithMediaDto } from "../dto/create-chat_history_with_media.dto";
import { ListChatHistoryDto } from "../dto/list-chat_history.dto";
import { ChatHistoryService } from "../services/chat_history.service";
/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class ChatHistoryHelper {
  constructor(
    private readonly appUserService: UserService,
    private readonly chatHistoryService: ChatHistoryService,
    private readonly chatRoomUserOptionService: ChatRoomUserOptionService,
    private readonly chatRoomService: ChatRoomService,
    private readonly mediaService: MediaService,
    private readonly notificationHelper: NotificationHelper
  ) {}

  private readonly logger = new Logger("chat_history");

  /**
   * @author Tony Vu
   * @param req
   * @param res
   * @param createChatHistoryDto
   */
  async createNewHistory(
    req: ExpressRequestDto,
    res: Response,
    createChatHistoryDto: CreateChatHistoryWithMediaDto,
    isReturnRes: boolean,
    isSendNotification: boolean
  ) {
    let currentTime = new Date();
    let userObject = req?.user_object;
    if (!userObject) {
      throw new BadRequestException("User is not invalid");
    }
    let authCode = req?.auth_code;

    //Validate Chat
    if (createChatHistoryDto.chat_room_id && (createChatHistoryDto.chat_content || createChatHistoryDto.media_data)) {
      let dataPermissionFilter = {
        chat_room_id: createChatHistoryDto.chat_room_id,
        user_id: userObject._id.toString(),
      };
      let dataFilterUserOption = {
        chat_room_id: createChatHistoryDto.chat_room_id,
      };
      let dataUserOption = await this.chatRoomUserOptionService.filterWithoutPage(dataFilterUserOption, {});
      let dataRoomUserOption = null;
      let dataRoomPartnerOption = null;
      if (dataUserOption && dataUserOption.length) {
        for (let itemUserOption of dataUserOption) {
          if (itemUserOption.user_id.toString() === userObject._id.toString()) {
            dataRoomUserOption = itemUserOption;
          } else {
            dataRoomPartnerOption = itemUserOption;
          }
        }
      } else {
        if (isReturnRes) {
          throw new BadRequestException("Room is not invalid");
        } else {
          return null;
        }
      }
      if (!dataRoomUserOption) {
        if (isReturnRes) {
          throw new BadRequestException("User role not exist in this Room!");
        } else {
          return null;
        }
      }
      if (dataRoomUserOption && dataRoomUserOption.user_permission !== "write") {
        if (isReturnRes) {
          throw new BadRequestException("Can't send message to this room!");
        } else {
          return null;
        }
      }

      if (dataRoomUserOption.user_block) {
        if (isReturnRes) {
          throw new BadRequestException("Can't send message to this room because this room is Block!");
        } else {
          return null;
        }
      }

      let dataHistoryFirst = null;
      if (!dataRoomUserOption.chat_room_id?.is_count) {
        //Check Send Message
        let dataHistoryFilter = {
          createBy: userObject._id.toString(),
          chat_room_id: dataRoomUserOption.chat_room_id._id.toString(),
        };
        dataHistoryFirst = await this.chatHistoryService.findOneRoom(dataHistoryFilter);
      }

      //Prepare Media Data
      let dataMediaResult: any = {
        media_array: [],
        data_object: [],
        is_call: false,
        is_gift: false,
      };

      if (createChatHistoryDto.media_data) {
        try {
          let dataMediaArray = JSON.parse(createChatHistoryDto.media_data);
          dataMediaResult = await this.handleMediaData(dataMediaArray, createChatHistoryDto.chat_room_id);
        } catch (error) {
          if (isReturnRes) {
            this.logger.log("create Error: " + JSON.stringify(error));
            throw new NotAcceptableException("Media data input not valid!");
          } else {
            return null;
          }
        }
      }
      let chatContent = createChatHistoryDto.chat_content ? createChatHistoryDto.chat_content : "";
      let dataCreate = {
        user_type: "customer",
        parent_id: createChatHistoryDto.parent_id ? createChatHistoryDto.parent_id : null,
        chat_room_id: createChatHistoryDto.chat_room_id,
        chat_content: chatContent,
        chat_type: "",
        chat_status: "send",
        local_id: createChatHistoryDto.local_id ? createChatHistoryDto.local_id : null,
        createBy: userObject._id.toString(),
        send_at: currentTime.toUTCString(),
        read_at: currentTime.toUTCString(),
        media_ids: dataMediaResult.media_array,
      };

      let dataChat = await this.chatHistoryService.create(dataCreate);

      let dataReturn = {
        ...dataChat.toObject(),
        ...{ media_ids: dataMediaResult.data_object },
        ...{
          createBy: await this.handleGetUserBase(userObject),
        },
      };

      //Update Room Data
      let dataToUpdateRoom = {
        _id: createChatHistoryDto.chat_room_id,
      };

      let lastMessageString = "";
      //Update Data Media, Last Message and last History
      if (dataMediaResult.data_object && createChatHistoryDto.media_data) {
        await this.processMediaAfter(
          dataMediaResult.data_object,
          dataChat._id.toString(),
          createChatHistoryDto.chat_room_id
        );

        let stringLast = "gửi file/ảnh";
        if (dataMediaResult.is_call) {
          stringLast = "Cuộc gọi từ";
          lastMessageString = `${stringLast} ${userObject.display_name}`;
        } else {
          if (dataMediaResult?.is_gift) {
            stringLast = "tặng quà";
            lastMessageString = `${userObject.display_name} ${stringLast}`;
          } else {
            stringLast = "gửi file/ảnh";
            lastMessageString = `${userObject.display_name} ${stringLast}`;
          }
        }

        dataToUpdateRoom = {
          ...dataToUpdateRoom,
          ...{ last_message: lastMessageString },
          ...{ last_history: dataChat._id.toString() },
        };
      } else {
        dataToUpdateRoom = {
          ...dataToUpdateRoom,
          ...{ last_message: createChatHistoryDto.chat_content },
          ...{ last_history: dataChat._id.toString() },
        };
        lastMessageString = createChatHistoryDto.chat_content;
      }

      //Is count is User send message, and this user reply it
      let isCount = 0;

      //Update first History
      if (Number(dataRoomUserOption.chat_room_id.chat_history_count) === 0) {
        dataToUpdateRoom = {
          ...dataToUpdateRoom,
          ...{
            first_history: dataChat._id.toString(),
          },
        };
      } else {
        if (!dataRoomUserOption.chat_room_id?.is_count) {
          if (!dataHistoryFirst) {
            //Count
            dataToUpdateRoom = {
              ...dataToUpdateRoom,
              ...{
                is_count: 1,
              },
            };
            await this.appUserService.updateCount({ _id: userObject._id.toString() }, { chat_count: 1 });
            isCount = 1;
          }
        }
      }

      if (isCount && dataUserOption[0]?.ref_user) {
        //Update Reply status
        let userToUpdate = dataUserOption[0].ref_user;
        let findRef = {
          user_id: dataUserOption[0].ref_user,
          ref_user: dataUserOption[0].ref_user,
          chat_room_id: createChatHistoryDto.chat_room_id,
        };
        let dataToUpdateRef = {
          is_reply: 1,
        };
        await this.chatRoomUserOptionService.findOneAndUpdate(findRef, dataToUpdateRef);
        //Check Room in Day
        let currentDay = new Date().getTime();
        //@ts-ignore
        let createAt = new Date(dataUserOption[0]?.createdAt).getTime();
        let timeToCheck = (currentDay - createAt) / (1000 * 60 * 60);
        if (timeToCheck <= 24) {
          let dataUpdate = {
            _id: dataUserOption[0].ref_user,
          };
          await this.handleSendReply(dataUpdate, authCode);
        }
      }

      //Update Room
      let dataRoomUpdate = await this.chatRoomService.update(dataToUpdateRoom, true);

      //Update Chat Room User Option Count
      let dataUpdateOption = {
        chat_room_id: createChatHistoryDto.chat_room_id,
      };
      await this.chatRoomUserOptionService.updateCount(dataUpdateOption);

      let userPartnerArray = [];
      let userPartnerArrayNotification = [];
      for (let itemUserOption of dataUserOption) {
        if (itemUserOption?.user_id?._id.toString() !== userObject._id.toString()) {
          if (!itemUserOption.mute_status) {
            userPartnerArrayNotification.push(itemUserOption.user_id);
          }
          userPartnerArray.push(itemUserOption.user_id);
          //Update Count Chat Room
          let dataFilter = {
            chat_room_id: createChatHistoryDto.chat_room_id,
            user_id: itemUserOption.user_id.toString(),
          };
          await this.chatRoomUserOptionService.incCountView(dataFilter);
        }
      }

      //Prepare data for Socket & Notification

      //For Sender
      let dataOptionSender = {
        ...dataRoomUserOption.toObject(),
        ...{
          chat_history_count: dataRoomUserOption.chat_history_count + 1,
        },
        chat_room_id: dataRoomUpdate.toObject(),
      };

      //For Partner
      let dataOptionPartner = {
        ...dataRoomPartnerOption?.toObject(),
        ...{
          read_count: dataRoomPartnerOption.read_count + 1,
          chat_history_count: dataRoomPartnerOption.chat_history_count + 1,
        },
        chat_room_id: dataRoomUpdate.toObject(),
        partner_id: await this.handleGetUserBase(userObject),
      };

      dataReturn = {
        ...dataReturn,
        ...{
          chat_room_data: { ...dataOptionSender, ...{ last_updated: new Date() } },
        },
      };

      let dataReturnForPartner = {
        ...dataReturn,
        ...{
          chat_room_data: { ...dataOptionPartner, ...{ last_updated: new Date() } },
        },
      };

      if (userPartnerArrayNotification && userPartnerArrayNotification.length && isSendNotification) {
        this.handleSendNotification(
          userObject,
          userPartnerArrayNotification,
          lastMessageString,
          dataReturn,
          authCode,
          req
        );
      }

      this.handleSendMessage(dataReturn, dataReturnForPartner, userPartnerArray, userObject._id.toString(), authCode);
      if (isReturnRes) {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count, X-Is-Count", "X-Is-Count": isCount })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        return dataReturn;
      }
    } else {
      if (isReturnRes) {
        throw new NotAcceptableException("Data input not valid!");
      } else {
        return null;
      }
    }
  }

  async handleSendMessage(message: any, messageForPartner: any, partnerArray: User[], userId: string, auth: string) {
    let dataToUpdate = {
      message: JSON.stringify(message),
      messageForPartner: JSON.stringify(messageForPartner),
      partnerArray: JSON.stringify(partnerArray),
    };
    const params = new URLSearchParams(dataToUpdate);
    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Authorization": auth,
      },
    };
    const urlLogin = process.env.SOCKET_API;

    let dataNotification = await axios
      .post(urlLogin + "/send-message", params, config)
      .then((response) => {
        if (response?.data) {
          this.logger.log("Send Message Successfully" + JSON.stringify(response.data));
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
        return false;
      });
    return dataNotification;
  }

  async handleSendReply(message: any, auth: string) {
    let dataToUpdate = {
      message: JSON.stringify(message),
    };
    const params = new URLSearchParams(dataToUpdate);
    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Authorization": auth,
      },
    };
    const urlLogin = process.env.SOCKET_API;

    let dataNotification = await axios
      .post(urlLogin + "/reply-room", params, config)
      .then((response) => {
        if (response?.data) {
          this.logger.log("Send Message Successfully" + JSON.stringify(response.data));
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
        return false;
      });
    return dataNotification;
  }

  /**
   * @author Tony Vu
   * @param req
   * @param res
   * @param query
   * @param id
   * @returns
   */
  async getRoomDetail(req: ExpressRequestDto, res: Response, query: ListChatHistoryDto, id: string) {
    try {
      let userObject = req?.user_object;
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }
      let dataToFind = {
        user_id: userObject._id.toString(),
        chat_room_id: id,
      };

      let dataUserOptionObject = await this.chatRoomUserOptionService.findOne(dataToFind);
      if (!dataUserOptionObject) {
        let dataChatRoom = await this.chatRoomService.findOneRoom({ _id: id });
        if (Number(dataChatRoom?.room_private) === 1) {
          throw new BadRequestException("User role not exist in this Room!");
        }
      }

      let dataFilter = {
        chat_room_id: id,
        from_id: query.from_id,
        to_id: query.to_id,
        search: query?.search,
        blocked_user: userObject.block_users,
      };
      let dataOrder = {
        createdAt: query.order_by,
      };
      if (dataUserOptionObject?.query_from) {
        dataFilter = {
          ...dataFilter,
          ...{
            from_id: dataUserOptionObject?.query_from,
          },
        };
      }

      let dataChat = await this.chatHistoryService.filter(dataFilter, dataOrder, query.page, query.limit);
      if (dataChat && dataChat.length) {
        //@ts-ignore
        //let dataCount = Number(dataUserOptionObject.chat_room_id?.chat_history_count);
        let dataCount = 0;
        return res
          .set({
            "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
            "X-Total-Count": Number(dataCount),
          })
          .status(HttpStatus.OK)
          .json(dataChat);
      } else {
        return res
          .set({
            "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
            "X-Total-Count": 0,
          })
          .status(HttpStatus.OK)
          .json([]);
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param res
   * @param req
   * @param createChatHistoryDto
   * @param files
   */
  async createMedia(res: Response, req: ExpressRequestDto, createChatHistoryDto: any, files: any) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }

      let fileArray = <any>[];
      let imageArray = <any>[];
      let videoArray = <any>[];
      let audioArray = <any>[];
      if (files?.videos) {
        videoArray = await this.processFile("videos", files.videos);
      }
      if (files?.images) {
        imageArray = await this.processFile("images", files.images);
      }
      if (files?.voices) {
        audioArray = await this.processFile("voices", files.voices);
      }
      if (files?.documents) {
        fileArray = await this.processFile("documents", files.documents);
      }

      let currentTime = new Date();
      //---Pending---Check Room User
      let dataCreate = {
        user_type: "customer",
        parent_id: null,
        chat_room_id: createChatHistoryDto.chat_room_id,
        chat_content: null,
        chat_audio: audioArray,
        chat_video: videoArray,
        chat_link: [],
        chat_file: fileArray,
        chat_image: imageArray,
        media_ids: [],
        chat_type: "",
        chat_status: "send",
        createBy: userObject._id.toString(),
        send_at: currentTime.toUTCString(),
        read_at: null,
      };
      let dataChat = await this.chatHistoryService.create(dataCreate);
      return res.status(HttpStatus.OK).json(dataChat);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param dataMediaArray
   * @param roomId
   * @returns
   */
  async handleMediaData(dataMediaArray: any[], roomId: string) {
    let dataIds = [];
    for (let mediaItem of dataMediaArray) {
      let mediaId = mediaItem.id;
      dataIds.push(Number(mediaId));
    }
    let dataFilter = {
      ids: dataMediaArray,
      is_history: true,
    };
    let isCall: boolean = false;
    let isGift: boolean = false;

    let dataSortBy = {};
    let projection = {
      media_url_presign: false,
      chat_history_id: false,
      chat_room_id: false,
      createBy: false,
      createdAt: false,
      updatedAt: false,
    };
    let mediaObjectArray = await this.mediaService.filter(dataFilter, dataSortBy, 100, 0, projection);
    let mediaArray = [];
    if (mediaObjectArray) {
      for (let mediaItem of mediaObjectArray) {
        if (mediaItem?.media_type?.indexOf("call") !== -1) {
          isCall = true;
        }
        if (mediaItem?.media_type?.indexOf("gift") !== -1) {
          isGift = true;
        }
        mediaArray.push(mediaItem?._id?.toString());
      }
    }
    return {
      is_gift: isGift,
      is_call: isCall,
      media_array: mediaArray,
      data_object: mediaObjectArray,
    };
  }

  /**
   * @author Tony Vu
   * @param mediaObject
   * @param chatId
   * @param chatRoomId
   * @returns
   */
  async processMediaAfter(mediaObject: any, chatId: string, chatRoomId: string) {
    let mediaReturn = [];
    if (mediaObject && mediaObject.length) {
      for (let mediaItem of mediaObject) {
        let statusUpdate = 0;
        if (Number(mediaItem.status) === 1) {
          statusUpdate = 1;
        }
        let dataToUpdate = {
          _id: mediaItem?._id?.toString(),
          media_status: statusUpdate,
          chat_history_id: chatId,
          chat_room_id: chatRoomId,
        };
        await this.mediaService.update(dataToUpdate);
        let dataToAdd = { ...mediaItem.toObject(), ...dataToUpdate };
        delete dataToAdd.chat_history_id;
        delete dataToAdd.chat_room_id;
        mediaReturn.push(dataToAdd);
      }
    }
    return mediaReturn;
  }

  /**
   * @author Tony Vu
   * @param fileType
   * @param fileArray
   * @param authCodeString
   * @returns
   */
  async processFile(fileType: string, fileArray: any[]) {
    let dataReturn = [];
    for (let fileObject of fileArray) {
      let fileExtensions = fileObject.originalname.slice(((fileObject.originalname.lastIndexOf(".") - 1) >>> 0) + 2);
      //let fileName = new Date().getTime() + '.' + fileExtensions;
      let fileName = fileObject.originalname;
      let fileType = fileObject.mimetype;
      let dataUrl = `?file_name=chat-tarot/${fileName}&file_type=${fileType}`;
      const config = {
        headers: {
          "X-Authorization": "",
        },
      };

      let dataPresign = await axios
        .get(process.env.TAROT_MAIN_API + "/media/presign" + dataUrl, config)
        .then((response) => {
          if (response?.data) {
            return response?.data;
          } else {
            return null;
          }
        })
        .catch((error) => {
          this.logger.log("processFile Error: " + JSON.stringify(error));
          return null;
        });

      if (dataPresign?.url) {
        let urlPut = dataPresign.url;
        let typeToPut = dataPresign.filetype;

        let dataS3 = await axios({
          method: "put",
          url: urlPut,
          data: fileObject.buffer,
          headers: { "Content-Type": typeToPut },
        })
          .then((response) => {
            if (response?.data) {
              return response.data;
            } else {
              return null;
            }
          })
          .catch((error) => {
            this.logger.log("processFile Error: " + JSON.stringify(error));
            return null;
          });
        let urlOriginal = "";
        let dataArrayUrl = urlPut.split("?");
        if (dataArrayUrl[0]) {
          urlOriginal = dataArrayUrl[0];
          dataReturn.push(urlOriginal);
        }
      }
    }
    return dataReturn;
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
    toUser: User[],
    lastMessage: any,
    dataChat: any,
    authCode,
    req: ExpressRequestDto
  ) {
    try {
      let notificationTitle = fromUser.display_name ? fromUser.display_name : fromUser.user_login;
      let chatContentToSend = "Tin nhắn: " + lastMessage;
      if (lastMessage && lastMessage.length >= 255) {
        chatContentToSend = lastMessage.substring(0, 250) + "...";
      }

      let userIdSend = "";
      let userIdArray = [];
      let language = "en";
      for (let userItem of toUser) {
        if (userItem?.country === "VN") {
          language = "vi";
        }
        userIdArray.push(userItem._id.toString());
      }

      if (!lastMessage) {
        let textSendFile = "send file to you!";
        if (language === "vi") {
          textSendFile = "gửi file tới bạn!";
        }
        chatContentToSend = notificationTitle + " " + textSendFile;
      }
      userIdSend = userIdArray.join(",");
      let dataToSendNotification = {
        chat_room_id: dataChat?.chat_room_id,
        path: "/chat/detail/",
        data_id: dataChat?.chat_room_id,
      };
      let notificationContent = chatContentToSend;
      let dataNotification = {
        createdBy: fromUser._id.toString(),
        user_id: userIdSend,
        title: notificationTitle?.toString(),
        content: notificationContent,
        param: JSON.stringify(dataToSendNotification),
        type_action: "link",
        router: "NAVIGATION_CHAT_ROOM",
        click_action: "",
        image: fromUser.user_avatar
          ? fromUser.user_avatar.toString()
          : "https://lgbtapp.s3.ap-southeast-1.amazonaws.com/2022/08/23/62e8a1df34a5b011e5d174e5-default_avatar.png",
        channel: "user",
      };
      await this.notificationHelper.handleSendNotification(dataNotification, authCode);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   *
   * @param userObject
   * @returns
   */
  async handleGetUserBase(userObject: User) {
    return {
      _id: userObject._id.toString(),
      user_login: userObject.user_login,
      user_role: userObject.user_role,
      user_status: userObject.user_status,
      last_active: userObject.last_active,
      user_active: userObject.user_active,
      user_avatar: userObject.user_avatar,
      display_name: userObject.display_name,
    };
  }
}
