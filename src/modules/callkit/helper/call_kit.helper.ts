import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Response } from "express";
import { Types } from "mongoose";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { ChatHistoryHelper } from "../../../modules/chat_history/helpers/chat_history.helper";
import { ChatRoomHelper } from "../../../modules/chat_room/helpers/chat_room.helper";
import { ChatRoomUserOptionService } from "../../../modules/chat_room/services/chat_room_user_option.service";
import { MediaService } from "../../../modules/media/services/media.service";
import { NotificationHelper } from "../../../modules/notification/helper/notification.helper";
import { SocketService } from "../../../modules/socket/services/socket.service";
import { SocketPath } from "../../../modules/socket/services/socket.service.i";
import { User } from "../../../modules/user/schemas/user.schema";
import { UserService } from "../../../modules/user/services/user.service";
import { UserBlockService } from "../../../modules/user/services/user_block.service";
import { GetCallkitDto } from "../dto/get-callkit.dto";
import { PostMakeRoomDto } from "../dto/post.make_room.dto";
import { SendVoipDto } from "../dto/send-voip.dto";
import { UpdateCallkitDto } from "../dto/update-callkit.dto";
import { Callkit } from "../schemas/callkit.schema";
import { CallkitService } from "../services/callkit.service";

/**
 * @author Tony Vu
 * @class MapHelper
 */
@Injectable()
export class CallKitHelper {
  constructor(
    private readonly userService: UserService,
    private readonly chatRoomUserOption: ChatRoomUserOptionService,
    private readonly chatRoomHelper: ChatRoomHelper,
    private readonly notificationHelper: NotificationHelper,
    private readonly callkitService: CallkitService,
    private readonly userBlockService: UserBlockService,
    private readonly mediaService: MediaService,
    private readonly chatHistoryHelper: ChatHistoryHelper,
    private readonly socketService: SocketService
  ) { }
  private readonly logger = new Logger("call");

  /**
   *
   * @param query
   * @param req
   * @param res
   * @returns
   */
  async handleEndCall(
    query: PostMakeRoomDto,
    req: ExpressRequestDto,
    res: Response,
    isAuto: boolean = false,
    isExpired: number = 0
  ) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new NotFoundException("User is invalid");
      }
      const authCode = req?.auth_code;
      const objectId = new Types.ObjectId(query.partner_id);
      if (!objectId) {
        throw new NotFoundException("Partner is invalid (Not is an ObjectID)");
      }

      if (!query?.partner_id) {
        throw new NotFoundException("Partner is invalid");
      }
      const roomName = "user_" + query.call_type + "_" + query.call_time + "_" + query.partner_id;

      const callkitObject = await this.callkitService.findOne({ room_name: roomName });
      let dataFromUser = null;
      let dataUser = null;
      let dataPartner = null;
      if (callkitObject) {
        try {
          const partnerObject = await this.userService.findById(query.partner_id.toString(), {});
          const fromUserId = callkitObject.user_id.toString();
          dataFromUser = await this.userService.findById(fromUserId, {});
          dataUser = {
            _id: dataFromUser._id.toString(),
            user_login: dataFromUser.user_login,
            user_avatar: dataFromUser.user_avatar,
            display_name: dataFromUser.display_name,
            user_active: dataFromUser.user_active,
            last_active: dataFromUser.last_active,
          };
          dataPartner = {
            _id: partnerObject._id.toString(),
            user_login: partnerObject.user_login,
            user_avatar: partnerObject.user_avatar,
            display_name: partnerObject.display_name,
            user_active: partnerObject.user_active,
            last_active: partnerObject.last_active,
          };

          // Serialize the token to a JWT and return it to the client side
          await this.handleEndCallSocket(
            dataFromUser,
            dataPartner,
            query.call_type,
            roomName,
            query.call_time,
            query.chat_room_id,
            authCode,
            isExpired
          );
        } catch (error) { }

        const currentTime = new Date();

        let dataToUpdate = {
          _id: callkitObject._id.toString(),
          end_time: currentTime.toUTCString(),
        };
        if (callkitObject.start_time) {
          const startTimeObject = new Date(callkitObject.start_time.toString());
          const totalSecond = Math.round((currentTime.getTime() - startTimeObject.getTime()) / 1000);
          dataToUpdate = {
            ...dataToUpdate,
            ...{
              call_time: totalSecond,
            },
          };
          const userIdToUpdate = callkitObject.user_id.toString();

          await this.chatRoomUserOption.incCountVideo(
            { user_id: userIdToUpdate, chat_room_id: query.chat_room_id },
            totalSecond
          );
        }
        const dataCallkitToHistory = await this.callkitService.update(dataToUpdate);

        if (!callkitObject?.end_time) {
          await this.handleCreateHistory(req, res, query, dataCallkitToHistory, false);
        }

        const dataToSend = {
          from_user: dataUser,
          to_user: dataPartner,
          call_type: query.call_type,
          room_id: roomName,
          chat_room_id: query.chat_room_id,
          call_time: query.call_time,
        };
        const dataNotification = {
          createdBy: dataFromUser?._id.toString(),
          user_id: query.partner_id,
          title: dataFromUser?.display_name.toString(),
          content: dataFromUser?.display_name + " has end call",
          param: JSON.stringify(dataToSend),
          type_action: "end_" + query.call_type,
          click_action: "",
          image: dataFromUser?.user_avatar
            ? dataFromUser?.user_avatar.toString()
            : "https://lgbtapp.s3.ap-southeast-1.amazonaws.com/2022/08/23/62e8a1df34a5b011e5d174e5-default_avatar.png",
          channel: "user",
        };
        if ((!query.notification || Number(query.notification) == 1) && dataFromUser) {
          await this.notificationHelper.handleSendNotification(dataNotification, authCode);
        }
        if (!isAuto) {
          res.json(dataToSend);
        }
      } else {
        throw new NotFoundException("Call is not invalid");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
    return null;
  }

  /**
   *
   * @param dataUpdate
   * @param req
   * @param res
   */
  async handleUpdateCall(dataUpdate: UpdateCallkitDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      const auth = req?.auth_code;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const callKitObject = await this.callkitService.findOne({ room_name: dataUpdate.room_id });
      if (!callKitObject) {
        throw new ForbiddenException("Call is not invalid");
      } else {
        //Update Room
        const dataAnswerCandidates = callKitObject?.answer_candidates ? callKitObject?.answer_candidates : [];
        const dataOfferCandidates = callKitObject?.offer_candidates ? callKitObject?.offer_candidates : [];

        let dataToUpdate = {
          user_id: callKitObject?.user_id?.toString(),
          partner_id: callKitObject?.partner_id?.toString(),
          room_id: dataUpdate.room_id,
        };

        if (dataUpdate?.answer_candidates) {
          dataAnswerCandidates.push(dataUpdate?.answer_candidates);
          dataToUpdate = { ...dataToUpdate, ...{ answer_candidates: dataUpdate?.answer_candidates?.toString() } };
        }
        if (dataUpdate?.offer_candidates) {
          dataOfferCandidates.push(dataUpdate?.offer_candidates);
          dataToUpdate = { ...dataToUpdate, ...{ offer_candidates: dataUpdate?.offer_candidates?.toString() } };
        }
        let dataUpdateToDB = {
          _id: callKitObject?._id?.toString(),
          offer_candidates: dataOfferCandidates,
          answer_candidates: dataAnswerCandidates,
        };
        if (dataUpdate?.offer) {
          dataUpdateToDB = { ...dataUpdateToDB, ...{ offer: dataUpdate?.offer } };
          dataToUpdate = { ...dataToUpdate, ...{ offer: dataUpdate?.offer?.toString() } };
        }
        if (dataUpdate?.answer) {
          dataUpdateToDB = { ...dataUpdateToDB, ...{ answer: dataUpdate?.answer } };
          dataToUpdate = { ...dataToUpdate, ...{ answer: dataUpdate?.answer?.toString() } };
        }

        if (dataUpdate?.is_mic) {
          dataToUpdate = { ...dataToUpdate, ...{ is_mic: dataUpdate?.is_mic } };
        }

        if (dataUpdate?.is_camera) {
          dataToUpdate = { ...dataToUpdate, ...{ is_camera: dataUpdate?.is_camera } };
        }

        if (dataUpdate?.camera_position) {
          dataToUpdate = { ...dataToUpdate, ...{ camera_position: dataUpdate?.camera_position } };
        }

        const dataUpdateReturn = await this.callkitService.update(dataUpdateToDB);
        //Send Socket
        const params = new URLSearchParams(dataToUpdate);
        const headers = {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Authorization": auth
        };
        this.socketService
          .send(SocketPath.UPDATE_CALL, headers, params)
          .then((response) => {
            if (response?.data) {
              this.logger.log("Send Call Successfully" + JSON.stringify(response.data));
              return true;
            } else {
              return false;
            }
          })
          .catch((error) => {
            this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
            return false;
          });
        res.json(dataUpdateReturn);
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param req
   * @param res
   * @returns
   */
  async handleMakeCall(query: PostMakeRoomDto, req: ExpressRequestDto, res: Response) {
    try {
      const isHasCall = false;
      const authCode = req?.auth_code;
      const userObject = req?.user_object;
      if (!userObject || !query?.partner_id?.toString()) {
        throw new NotFoundException("User is invalid");
      }
      const partnerObject: any = await this.userService.findOneLogin({ _id: query.partner_id.toString() });
      if (!partnerObject) {
        throw new BadRequestException("Partner is invalid");
      }
      const userId = userObject._id.toString();

      if (query.partner_id) {
        const blockFilter = {
          partner_id: userObject._id.toString(),
          user_id: query.partner_id,
        };
        const dataBlock = await this.userBlockService.findOne(blockFilter);
        if (dataBlock) {
          throw new BadRequestException("Can't call to this user!");
        }
      }

      if (userObject?.block_users && query.partner_id) {
        const blockUserObject = [];
        for (const blockItem of userObject?.block_users) {
          blockUserObject.push(blockItem.toString());
        }
        if (blockUserObject?.indexOf(query.partner_id) !== -1) {
          throw new BadRequestException("Can't call to this user!");
        }
      }

      //Check Callkit
      if (partnerObject._id?.toString() !== userObject._id.toString()) {
        //Check Callkit of Partner
        // let currentTime = new Date().getTime();
        // let lastTime = currentTime - 1000 * 60;
        // //Total Time in day!
        // let newTime = new Date(lastTime);
        // let dataFilter = {
        //   from_id: partnerObject?._id?.toString(),
        //   from_time: newTime.toUTCString(),
        //   start_time: { $ne: null },
        //   call_time: 0
        // };
        // let dataPartnerBefore = await this.callkitService.filter(dataFilter, {}, 1, 1);
        // if (dataPartnerBefore && dataPartnerBefore?.length) {
        //   throw new BadRequestException("User is calling someone else, please try again later!");
        // }
      }

      //Check First Call
      //Check Send Message
      // let dataHistoryFilter = {
      //   createBy: query.partner_id,
      //   chat_room_id: query.chat_room_id,
      // };
      // let dataHistoryFirst = await this.chatHistoryService.findOneRoom(dataHistoryFilter);
      // if (!dataHistoryFirst) {
      //   throw new BadRequestException(`You must have a conversation with ${partnerObject.display_name} before call!`);
      // }

      this.logger.log("Data Call: " + JSON.stringify(query));
      const dataToken = "";
      const roomName = "user_" + query.call_type + "_" + query.call_time + "_" + query.partner_id;

      const dataUser = {
        _id: userObject._id.toString(),
        user_login: userObject.user_login,
        user_avatar: userObject.user_avatar,
        display_name: userObject.display_name,
        user_active: userObject.user_active,
        last_active: userObject.last_active,
      };
      const dataPartner = {
        _id: partnerObject._id.toString(),
        user_login: partnerObject.user_login,
        user_avatar: partnerObject.user_avatar,
        display_name: partnerObject.display_name,
        user_active: partnerObject.user_active,
        last_active: partnerObject.last_active,
      };

      let answerCandidatesSocket = query?.answer_candidates;
      let offerCandidatesSocket = query?.offer_candidates;

      //Check user Call
      // let dataUserTo = null;
      let dataUserFrom: any = userObject;

      let dataToSend = {
        from_user: dataUser,
        to_user: dataPartner,
        token: dataToken,
        chat_room_id: query.chat_room_id,
        room_id: roomName,
        call_type: query.call_type,
        call_time: query.call_time,
      };

      const callkitObject = await this.callkitService.findOne({ room_name: roomName });
      if (callkitObject) {
        if (callkitObject?.end_time) {
          //isHasCall = true;
        }
        //If callkit difference
        if (Number(callkitObject?.version) != Number(query?.version)) {
          //Set false
          await this.handleSendNewVersion(userObject, query?.chat_room_id, req, res);
          throw new BadRequestException(
            "This user is using a new version of the app, please update your app to reach them!"
          );
        }
        dataUserFrom = await this.userService.findOneLogin({ _id: callkitObject?.user_id?.toString() });
        const currentTime = new Date();
        let dataToUpdate = {
          _id: callkitObject._id.toString(),
          start_time: currentTime.toUTCString(),
          partner_token: dataToken,
        };
        if (query?.answer && Number(query?.version) == 2) {
          dataToUpdate = { ...dataToUpdate, ...{ answer: query?.answer } };
        }

        if (query?.offer && Number(query?.version) == 2) {
          dataToUpdate = { ...dataToUpdate, ...{ offer: query?.offer } };
        }

        if (query?.answer_candidates && Number(query?.version) == 2) {
          dataToUpdate = { ...dataToUpdate, ...{ answer_candidates: JSON.parse(query?.answer_candidates) } };
        }
        if (query?.offer_candidates && Number(query?.version) == 2) {
          dataToUpdate = { ...dataToUpdate, ...{ offer_candidates: JSON.parse(query?.offer_candidates) } };
        }
        const dataUpdate = await this.callkitService.update(dataToUpdate);
        answerCandidatesSocket = JSON.stringify(dataUpdate?.answer_candidates);
        offerCandidatesSocket = JSON.stringify(dataUpdate?.offer_candidates);
        dataToSend = {
          ...dataToSend,
          ...{
            answer_candidates: dataUpdate?.answer_candidates,
            offer_candidates: dataUpdate?.offer_candidates,
            answer: dataUpdate?.answer,
            offer: dataUpdate?.offer,
          },
        };

        //FOR CALL_U
        if (partnerObject._id?.toString() !== userObject._id.toString()) {
          // Serialize the token to a JWT and return it to the client side
        } else {
          if (process.env.BRANCH_NAME === "live_video") {
            // dataUserTo = await this.userService.findOneLogin({ _id: userObject._id.toString() });

            //Check coin of User Men
            let totalCoin = 10;
            if (dataUserFrom && Number(dataUserFrom?.current_coin)) {
              totalCoin = Number(dataUserFrom?.current_coin);
            }
            if (Number(query?.notification) != 1) {
              //Set Timeout to End call
              setTimeout(async () => {
                const dataCall = await this.callkitService.findOne({
                  room_name: "user_" + query.call_type + "_" + query.call_time + "_" + query.partner_id,
                });
                if (Number(callkitObject.call_time) == 0) {
                  //Handle End Call
                  this.handleEndCall(query, req, res, true, 1);
                }
              }, totalCoin * 1000);
            }
          }
        }
      } else {
        const currentTime = new Date();
        let dataCallkitCreate = {
          user_id: userObject._id.toString(),
          partner_id: query.partner_id,
          room_name: roomName,
          type_server: "go",
          call_type: query.call_type,
          first_ring: currentTime.toUTCString(),
          token: dataToken,
          offer: query?.offer,
          answer: query?.answer,
        };
        if (query?.answer_candidates && Number(query?.version) == 2) {
          dataCallkitCreate = { ...dataCallkitCreate, ...{ answer_candidates: JSON.parse(query?.answer_candidates) } };
        }
        if (query?.offer_candidates && Number(query?.version) == 2) {
          dataCallkitCreate = { ...dataCallkitCreate, ...{ offer_candidates: JSON.parse(query?.offer_candidates) } };
        }
        if (query?.version) {
          dataCallkitCreate = { ...dataCallkitCreate, ...{ version: query?.version } };
        }
        const dataCreate = await this.callkitService.create(dataCallkitCreate);
        dataToSend = {
          ...dataToSend,
          ...{
            answer_candidates: dataCreate?.answer_candidates,
            offer_candidates: dataCreate?.offer_candidates,
            answer: dataCreate?.answer,
            offer: dataCreate?.offer,
          },
        };
        // setTimeout(async () => {
        //   let callkitObject = await this.callkitService.findOne({ room_name: room.uniqueName });
        //   if (callkitObject && !callkitObject.start_time) {
        //     let dataToUpdate = {
        //       _id: callkitObject._id.toString(),
        //       call_type: "miss_call_" + callkitObject.call_type,
        //     };
        //     await this.callkitService.update(dataToUpdate);
        //     // Serialize the token to a JWT and return it to the client side
        //     this.chatSocketService.handleEndCall(
        //       dataUser,
        //       dataPartner,
        //       query.call_type,
        //       query.call_time,
        //       room.uniqueName,
        //       query.chat_room_id
        //     );
        //     //Send notification
        //     await this.handleCreateHistory(query, callkitObject, true);

        //     let dataNotification = {
        //       createdBy: userObject._id.toString(),
        //       user_id: query.partner_id,
        //       title: userObject.display_name.toString(),
        //       content: userObject.display_name + " has end call",
        //       param: JSON.stringify(dataToSend),
        //       type_action: "end_" + query.call_type,
        //       click_action: "",
        //       image: userObject.user_avatar
        //         ? userObject.user_avatar.toString()
        //         : "https://lgbtapp.s3.ap-southeast-1.amazonaws.com/2022/08/23/62e8a1df34a5b011e5d174e5-default_avatar.png",
        //       channel: "user",
        //     };
        //     await this.notificationHelper.handleSendNotification(dataNotification);
        //   }
        // }, 40000);
      }

      //Send Notification
      if (query.partner_id !== userObject._id.toString()) {
        await this.handleMakeCallSocket(
          dataToken,
          dataUser,
          dataPartner,
          query.call_type,
          roomName,
          query.call_time,
          query.chat_room_id,
          authCode,
          query?.answer,
          query?.offer,
          answerCandidatesSocket,
          offerCandidatesSocket
        );

        if (!query.notification || Number(query.notification) == 1) {
          const dataToSendNotification = JSON.parse(JSON.stringify(dataToSend));
          delete dataToSendNotification.offer;
          delete dataToSendNotification.answer;
          delete dataToSendNotification.offer_candidates;
          delete dataToSendNotification.answer_candidates;
          const dataNotification = {
            createdBy: userObject._id.toString(),
            user_id: query.partner_id,
            title: userObject.display_name.toString(),
            content: userObject.display_name + " call to you",
            param: JSON.stringify(dataToSendNotification),
            type_action: query.call_type,
            click_action: "",
            image: userObject.user_avatar
              ? userObject.user_avatar.toString()
              : "https://lgbtapp.s3.ap-southeast-1.amazonaws.com/2022/08/23/62e8a1df34a5b011e5d174e5-default_avatar.png",
            channel: "user",
          };
          await this.notificationHelper.handleSendNotification(dataNotification, authCode);
        }
      } else if (Number(query?.version) === 2) {
        await this.handleMakeCallSocket(
          dataToken,
          dataUserFrom,
          dataPartner,
          query.call_type,
          roomName,
          query.call_time,
          query.chat_room_id,
          authCode,
          query?.answer,
          query?.offer,
          answerCandidatesSocket,
          offerCandidatesSocket
        );
      }
      dataToSend = { ...dataToSend, ...{ is_has_call: isHasCall } };

      res.json(dataToSend);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
    return null;
  }

  /**
   *
   * @param userObject
   * @param chatRoomId
   */
  async handleSendNewVersion(userObject: User, chatRoomId: string, req: any, res: any) {
    const newMessage = `Hi ${userObject?.display_name} please update your app so you can call your friend. Currently your friend using the new app version!`;
    const roomName = "New call";
    await this.chatRoomHelper.setSystemMessage(newMessage, userObject, chatRoomId, roomName, req, res);
  }

  /**
   * @author Tony Vu
   * @param query
   * @param req
   * @param res
   * @returns
   */
  async handleSendVoIP(data: SendVoipDto, req: ExpressRequestDto, res: Response) {
    try {
      let dataParam = {};
      if (data.param) {
        dataParam = JSON.parse(data.param);
      }
      const dataReturn = await this.notificationHelper.handleSendNotificationApple(
        [data.token],
        "Call to you!",
        dataParam
      );
      res.json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleCreateHistory(
    req: ExpressRequestDto,
    res: Response,
    query: PostMakeRoomDto,
    callkitObject: Callkit,
    isMissCall: boolean
  ) {
    const roomName = "user_" + query.call_type + "_" + query.call_time + "_" + query.partner_id;
    const currentTime = new Date();

    const objectId = new Types.ObjectId(query?.chat_room_id);
    if (!objectId) {
      return null;
    }
    let isHaveMinute = false;

    if (callkitObject.start_time) {
      isHaveMinute = true;
    }

    //Update to Media & Chat
    const mediaMeta = [
      {
        key: "start_time",
        value: callkitObject.start_time,
      },
      {
        key: "end_time",
        value: callkitObject.end_time,
      },
      {
        key: "call_time",
        value: callkitObject.call_time.toString(),
      },
      {
        key: "partner_id",
        value: callkitObject.partner_id.toString(),
      },
      {
        key: "first_ring",
        value: callkitObject.first_ring,
      },
      {
        key: "call_type",
        value: !isHaveMinute ? "miss_call_" + query.call_type : query.call_type,
      },
    ];
    const dataToCreate = {
      media_url: roomName,
      createBy: callkitObject.user_id.toString(),
      media_type: query.call_type,
      media_mime_type: query.call_type,
      media_file_name: query.call_type,
      media_thumbnail: query.call_type,
      media_meta: mediaMeta,
      chat_room_id: query.chat_room_id,
      chat_history_id: null,
      media_status: 1,
    };
    const dataMedia = await this.mediaService.create(dataToCreate);
    if (dataMedia) {
      // let dataCreate = {
      //   user_type: "customer",
      //   parent_id: null,
      //   chat_room_id: query.chat_room_id,
      //   chat_content: "",
      //   chat_type: "",
      //   chat_status: "send",
      //   local_id: null,
      //   createBy: callkitObject.user_id.toString(),
      //   send_at: currentTime.toUTCString(),
      //   read_at: currentTime.toUTCString(),
      //   media_ids: [dataMedia._id.toString()],
      // };
      //await this.chatHistoryService.create(dataCreate);
      //Send Notification

      const createChatHistoryDto = {
        chat_room_id: query.chat_room_id,
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
    }
    return true;
  }

  /**
   * @author Tony Vu
   * @param token
   * @param userObject
   * @param partnerObject
   * @param callType
   */
  async handleMakeCallSocket(
    token: string,
    userObject: any,
    partnerObject: any,
    callType: string,
    roomId: string,
    callTime: string,
    chatRoomId: string,
    auth: string,
    answer: string = "",
    offer: string = "",
    answer_candidates: string = "",
    offer_candidates: string = ""
  ) {
    try {
      const partnerId = partnerObject._id.toString();
      this.logger.log("Send a Call to room: " + partnerId);
      const dataToUpdate = {
        userObject: JSON.stringify(userObject),
        partnerObject: JSON.stringify(partnerObject),
        token: token,
        callType: callType,
        callTime: callTime,
        roomId: roomId,
        chatRoomId: chatRoomId,
        answer: answer,
        offer: offer,
        answerCandidates: answer_candidates,
        offerCandidates: offer_candidates,
      };

      // send socket
      const params = new URLSearchParams(dataToUpdate);
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Authorization": auth
      };
      const dataNotification = await this.socketService
        .send(SocketPath.MAKE_CALL, headers, params)
        .then((response) => {
          console.log(response, 'response')
          if (response?.data) {
            this.logger.log("Send Call Successfully" + JSON.stringify(response.data));
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
    } catch (error) {
      console.log(error, 'errror')
      return null;
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
  async getListCall(query: GetCallkitDto, res: Response, req: ExpressRequestDto) {
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
      const dataToFilter = { ...query, ...{ from_id: userId } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.callkitService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.callkitService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param userObject
   * @param partnerObject
   * @param callType
   */
  async handleEndCallSocket(
    userObject: any,
    partnerObject: any,
    callType: string,
    roomId: string,
    callTime: string,
    chatRoomId: string,
    auth: string,
    isExpired: number
  ) {
    try {
      const partnerId = partnerObject._id.toString();
      this.logger.log("Send a Call to room partner: " + partnerId);
      this.logger.log("Send a Call to room user: " + userObject?._id?.toString());
      const dataToUpdate = {
        userObject: JSON.stringify(userObject),
        partnerObject: JSON.stringify(partnerObject),
        token: "",
        callType: callType,
        callTime: callTime,
        roomId: roomId,
        chatRoomId: chatRoomId,
        isExpired: isExpired ? "1" : "0",
      };
      const params = new URLSearchParams(dataToUpdate);
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Authorization": auth
      };
      const dataNotification = await this.socketService
        .send(SocketPath.END_CALL, headers, params)
        .then((response) => {
          if (response?.data) {
            this.logger.log("Send Call Successfully" + JSON.stringify(response.data));
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
    } catch (error) {
      return null;
    }
  }
}
