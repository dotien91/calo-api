import { Response, Request, response } from "express";
import {
  ForbiddenException,
  HttpStatus,
  NotFoundException,
  Injectable,
  BadRequestException,
  Res,
  Req,
  Param,
  NotAcceptableException,
} from "@nestjs/common";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateLivestreamDto } from "../dto/create-livestream.dto";
import { LivestreamService } from "../services/livestream.service";
import { ListLivestreamDto } from "../dto/list-livestream.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateLivestreamDto } from "../dto/update-livestream.dto";
import { Types } from "mongoose";
import { ChatMediaService } from "../../../modules/chat_media/services/chat_media.service";
import { User } from "../../../modules/user/schemas/user.schema";
import { CreateLivestreamLikeDto } from "../dto/create-livestream_like.dto";
import { LivestreamLikeService } from "../services/livestream_like.service";
import { LivestreamViewService } from "../services/livestream_view.service";
import { CreateLivestreamViewDto } from "../dto/create-livestream_view.dto";
import { UserOptionService } from "../../../modules/user/services/user_option.service";
import { CreateLivestreamCommentWithMediaDto } from "../dto/create-livestream_comment.dto";
import { LivestreamCommentService } from "../services/livestream_comment.service";
import axios from "axios";
import { ListLivestreamCommentDto } from "../dto/list-livestream_comment.dto";
import { Livestream } from "../schemas/livestream.schema";
import { ChannelPermissionService } from "../../../modules/channel/services/channel_permission.service";
import { NotificationHelper } from "../../../modules/notification/helper/notification.helper";
import { EventService } from "../../../modules/event/services/event.service";
import { ChannelService } from "../../../modules/channel/services/channel.service";
import { Event } from "../../../modules/event/schemas/event.schema";
import { RequestService } from "../../../modules/request/services/request.service";
const { getFirestore } = require("firebase-admin/firestore");

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class LivestreamHelper {
  constructor(
    private livestreamService: LivestreamService,
    private userPermissionService: UserPermissionService,
    private chatMediaService: ChatMediaService,
    private livestreamLikeService: LivestreamLikeService,
    private livestreamViewService: LivestreamViewService,
    private userOptionService: UserOptionService,
    private livestreamCommentService: LivestreamCommentService,
    private channelPermissionService: ChannelPermissionService,
    private notificationHelper: NotificationHelper,
    private eventService: EventService,
    private channelService: ChannelService,
    private requestService: RequestService
  ) {}

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewLivestream(createLivestreamData: CreateLivestreamDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      let authString = req?.auth_code;
      let channelId = req?.channel_id;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let userId = req?.user_id;
      let userPermission = await this.channelPermissionService.findOne({
        user_id: userId,
        channel_id: req?.channel_id,
      });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("mentor/list") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "mentor/list")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this action!");
      }

      console.log(createLivestreamData, "createLivestreamData");
      let userOptionData = await this.userOptionService.findById(userObject?._id.toString(), {});
      createLivestreamData = {
        ...createLivestreamData,
        ...{ user_id: userId, country: userOptionData?.country, channel_id: channelId },
      };

      if (createLivestreamData?.livestream_data) {
        try {
          createLivestreamData = {
            ...createLivestreamData,
            ...{ livestream_data: JSON.parse(createLivestreamData?.livestream_data) },
          };
        } catch (error) {
          console.log(error);
        }
      }
      let dataCreate: any = await this.livestreamService.create(createLivestreamData);
      dataCreate = dataCreate.toObject();
      dataCreate = {
        ...dataCreate,
        ...{
          user_id: await this.handleGetUserBase(userObject),
          is_like: false,
          is_view: false,
        },
      };
      //Update Cloudflare
      dataCreate = await this.handleCloudflareData(dataCreate);

      setTimeout(async () => {
        //Update dataPost
        //let dataTitle = userObject?.display_name + ' thêm một livestream mới!';
        //let dataSlug = this.toSlug(dataTitle);

        // let dataCreatePost = {
        //   post_language: "vi",
        //   post_content: "",
        //   post_slug: dataSlug,
        //   post_title: dataTitle,
        //   channel_id: channelId,
        //   post_expert: dataTitle,
        //   post_status: "publish",
        //   ref_id: dataCreate?._id,
        //   user_id: userObject?._id?.toString(),
        //   country: "VN",
        //   data_json_type: "livestream",
        //   data_json: JSON.stringify(dataCreate),
        //   post_avatar: dataCreate?.avatar?.toString()
        // }
        // await this.requestService.create(dataCreatePost)
        // let eventObject = await this.eventService.findOne({ livestream_id: dataCreate?._id?.toString() });
        let channelObject = await this.channelService.findOne({ _id: channelId });
        await this.handleSendNotificationToAllCreate(userObject, dataCreate, authString, channelObject, req);
      }, 500);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
    } catch (error) {
      console.log(error);
      throw new NotFoundException(error.message);
    }
  }

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
    str = str.replace(/-+$/g, "") + new Date().getTime();
    return str;
  }

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async updateLivestream(dataUpdate: UpdateLivestreamDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      let authString = req?.auth_code;
      let channelId = req?.channel_id;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let firstData = await this.livestreamService.findOne({ _id: dataUpdate?._id });
      //Get Media Data

      let userId = req?.user_id;
      let userPermission = await this.channelPermissionService.findOne({
        user_id: userId,
        channel_id: req?.channel_id,
      });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("mentor/list") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "mentor/list")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this action!");
      }

      if (dataUpdate?.livestream_data) {
        try {
          dataUpdate = { ...dataUpdate, ...{ livestream_data: JSON.parse(dataUpdate?.livestream_data) } };
        } catch (error) {}
      }

      let dataCreate: any = await this.livestreamService.update(dataUpdate);
      channelId = dataCreate?.channel_id?.toString();
      if (dataUpdate.livestream_status === "end") {
        //Update to Socket
        await this.handleUpdateEndLivestream(dataCreate, authString);
        // await this.handleUpdateCloudflareData(dataCreate, 'automatic');
      }

      if (dataUpdate.livestream_status === "live") {
        //Update to Socket
        await this.handleUpdateStartLivestream(dataCreate, authString);
        //Check first status
        if (firstData?.livestream_status !== "live") {
          setTimeout(async () => {
            //Remove
            await this.requestService.removeOne({ ref_id: dataCreate?._id?.toString() });
            //Update dataPost
            let dataTitle = userObject?.display_name + " đang livestream!";
            let dataSlug = this.toSlug(dataTitle);

            let dataCreatePost = {
              post_language: "vi",
              post_content: "",
              post_slug: dataSlug,
              post_title: dataTitle,
              channel_id: channelId,
              post_expert: dataTitle,
              ref_id: dataCreate?._id?.toString(),
              post_status: "publish",
              user_id: userObject?._id?.toString(),
              country: "VN",
              data_json_type: "livestream",
              data_json: JSON.stringify(dataCreate),
              post_avatar: dataCreate?.avatar?.toString(),
            };
            await this.requestService.create(dataCreatePost);
            let channelObject = await this.channelService.findOne({ _id: channelId });
            await this.handleSendNotificationToAllNow(userObject, dataCreate, authString, channelObject, req);
          }, 500);
        }
        // await this.handleUpdateCloudflareData(dataCreate, 'automatic');
      }
      if (firstData?.input_type != "outside") {
        await this.handleCheckLivestream(dataCreate, authString);
      }

      // if (Number(dataUpdate.livestream_status) === 2 && process.env.BRANCH_NAME === "tiktok") {
      //   //Update
      //   let dataUser = await this.chatMediaService.findById(dataCreate?.ref_id?._id);
      //   let userTiktokId = dataUser?.media_file_name;
      //   let urlEndRoom = `${process.env.LIVESTREAM_URL}/end_room?tiktok_username=${userTiktokId}`;
      //   const config = {
      //     headers: {
      //       "Content-Type": "application/x-www-form-urlencoded",
      //       "x-authentication": "Y2hhb2NhY2Jhbg==",
      //     },
      //   };
      //   await axios
      //     .get(urlEndRoom, config)
      //     .then((response) => {
      //       if (response?.data) {
      //         return true;
      //       } else {
      //         return false;
      //       }
      //     })
      //     .catch((error) => {
      //       return false;
      //     });
      // }

      dataCreate = dataCreate.toObject();
      dataCreate = {
        ...dataCreate,
        ...{
          user_id: await this.handleGetUserBase(userObject),
          is_like: false,
          is_view: false,
        },
      };

      let eventObject = await this.eventService.findOne({ livestream_id: dataCreate?._id?.toString() });
      if (eventObject) {
        dataCreate = { ...dataCreate, ...{ event_data: eventObject } };
      } else {
        dataCreate = { ...dataCreate, ...{ event_data: null } };
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
   * @author Tony Vu
   */
  async handleCheckLivestream(dataPrepare: Livestream, authString: string) {
    try {
      //Check if dataCreate.input_type == outside
      if (dataPrepare?.input_type == "outside") {
        //Check Interval
        let dataCountFalse = 0;
        let dataInterval = setInterval(async () => {
          let dataCreate = await this.livestreamService.findOne({ _id: dataPrepare?._id?.toString() });
          //Check Status Cloud Flare
          let urlCloudFlare = `https://customer-xmrvysjqwvfwuq70.cloudflarestream.com/${dataCreate?.cloudflare_stream_id}/lifecycle`;

          // const params = new URLSearchParams(dataToUpdate);
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + process.env.CLOUDFLARE_TOKEN,
            },
          };
          // console.log(config, 'config')
          let dataLivestreamCloudflare = await axios
            .get(urlCloudFlare, config)
            .then((response: any) => {
              return response?.data;
            })
            .catch((error) => {
              console.log(error);
              return null;
            });
          console.log(dataLivestreamCloudflare, "dataLivestreamCloudflare");
          if (dataLivestreamCloudflare) {
            //Check data
            if (dataLivestreamCloudflare?.live == true) {
              //Check current live_status
              if (dataCreate?.livestream_status != "wait") {
                //Send Emit offer
                if (dataCreate?.ready_status === "disconnected") {
                  let dataJsonToEmit = {
                    offer: {
                      payload: { status: "StartStreamSuccess" },
                      room_id: "livestream_" + dataCreate?._id?.toString(),
                    },
                    data_livestream: dataCreate,
                  };

                  await this.handleSendEmitOffer(dataJsonToEmit, authString);
                  let dataToUpdate = {
                    _id: dataCreate?._id?.toString(),
                    ready_status: "connected",
                  };
                  console.log(dataToUpdate, "dataToUpdate");
                  //Udpate readystatus to connected
                  await this.livestreamService.update(dataToUpdate);
                }
              } else {
                //Update start Livestream
                let dataToUpdate = {
                  _id: dataCreate?._id?.toString(),
                  livestream_status: "live",
                  ready_status: "connected",
                };
                console.log(dataToUpdate, "dataToUpdate");
                //Udpate readystatus to connected
                dataCreate = await this.livestreamService.update(dataToUpdate);
                await this.handleUpdateStartLivestream(dataCreate, authString);
              }
              dataCountFalse = 0;
            } else {
              dataCountFalse++;
              console.log(dataCountFalse, "dataCountFalse");
              if (dataCountFalse >= 50) {
                //Clear interval
                clearInterval(dataInterval);
                //Update status Livestream
                let dataToUpdate = {
                  _id: dataCreate?._id?.toString(),
                  ready_status: "disconnected",
                  livestream_status: "end",
                };
                console.log(dataToUpdate, "dataToUpdate");
                //Udpate readystatus to connected
                dataCreate = await this.livestreamService.update(dataToUpdate);
                await this.handleUpdateEndLivestream(dataCreate, authString);
              } else {
                if (dataCreate?.livestream_status === "live" && dataCreate?.ready_status === "connected") {
                  let dataToUpdate = {
                    _id: dataCreate?._id?.toString(),
                    ready_status: "disconnected",
                  };
                  console.log(dataToUpdate, "dataToUpdate");
                  //Udpate readystatus to connected
                  dataCreate = await this.livestreamService.update(dataToUpdate);
                  await this.handleUpdateLeaveRoomToClient(dataCreate, authString);
                }
              }
            }
          }
        }, 5000);
      }
    } catch (error) {
      //Error when update Livestream
      return null;
    }
  }

  async handleCloudflareData(dataLivestream: Livestream) {
    try {
      let urlCloudFlare =
        "https://api.cloudflare.com/client/v4/accounts/2cd5df15a97f55e0045d3e45eb0e62e9/stream/live_inputs";
      // const params = new URLSearchParams(dataToUpdate);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + process.env.CLOUDFLARE_TOKEN,
        },
      };

      let dataToUpdate = {
        meta: { name: dataLivestream?.title },
        recording: { mode: "automatic" },
        deleteRecordingAfterDays: null,
      };
      // console.log(config, 'config')
      let dataLivestreamCloudflare = await axios
        .post(urlCloudFlare, dataToUpdate, config)
        .then((response) => {
          if (response?.data) {
            // console.log(response?.data, "response?.data");
            return response?.data;
            return true;
          } else {
            return null;
          }
        })
        .catch((error) => {
          // console.log(error);
          // console.log(error.response.data, 'data error');
          // this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
          console.log(error, "error");
          return null;
        });

      if (dataLivestreamCloudflare && dataLivestreamCloudflare?.result) {
        let whipData = dataLivestreamCloudflare?.result?.webRTC?.url || "";
        let whepData = dataLivestreamCloudflare?.result?.webRTCPlayback?.url || "";
        let cloudflareStreamId = dataLivestreamCloudflare?.result?.uid || "";
        let m3u8Url = dataLivestreamCloudflare?.result?.webRTCPlayback?.url;
        m3u8Url = m3u8Url.replace("webRTC/play", "manifest/video.m3u8");
        let dataUpdate = {
          cloudflare_stream_id: cloudflareStreamId,
          whip_data: whipData,
          whep_data: whepData,
          livestream_data: {
            rtmp_url: dataLivestreamCloudflare?.result?.rtmps?.url || "",
            m3u8_url: m3u8Url || "",
            ingest_endpoint: "",
            stream_key: dataLivestreamCloudflare?.result?.rtmps?.streamKey || "",
          },
          _id: dataLivestream?._id?.toString(),
        };
        return await this.livestreamService.update(dataUpdate);
      }
      return dataLivestream;
    } catch (error) {
      console.log(error);
      return dataLivestream;
    }
  }

  /**
   *
   * @param dataLivestream
   * @returns
   */
  async handleUpdateCloudflareData(dataLivestream: Livestream, dataRecord: string) {
    try {
      if (!dataLivestream?.cloudflare_stream_id) {
        return dataLivestream;
      }
      let urlCloudFlare =
        "https://api.cloudflare.com/client/v4/accounts/2cd5df15a97f55e0045d3e45eb0e62e9/stream/live_inputs/" +
        dataLivestream?.cloudflare_stream_id;

      let dataToUpdate = {
        meta: { name: dataLivestream?.title },
        recording: { mode: dataRecord },
        deleteRecordingAfterDays: null,
      };
      // const params = new URLSearchParams(dataToUpdate);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + process.env.CLOUDFLARE_TOKEN,
        },
      };
      // console.log(config, 'config')
      let dataNotification = await axios
        .put(urlCloudFlare, dataToUpdate, config)
        .then((response) => {
          if (response?.data) {
            // console.log(response?.data, "response?.data");
            return response?.data;
            return true;
          } else {
            return null;
          }
        })
        .catch((error) => {
          return null;
        });
      return dataLivestream;
    } catch (error) {
      console.log(error);
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
  async getLivestreamListByAdmin(query: ListLivestreamDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "livestream/list")) {
        if (Number(query.limit) > 1000) {
          query.limit = 1000;
        }

        let limit = query.limit ? query.limit : 1000;
        let page = query.page ? query.page : 1;
        let orderByOBject = {};
        if (query.order_by) {
          orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
        }
        let dataToFilter = { ...query };
        delete dataToFilter.page;
        delete dataToFilter.limit;
        delete dataToFilter.order_by;
        let dataReturn = await this.livestreamService.filter(dataToFilter, orderByOBject, page, limit);
        let dataCount = await this.livestreamService.count(dataToFilter);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
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
  async getLivestreamList(query: ListLivestreamDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();

      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      let dataReturn: any = await this.livestreamService.filter(dataToFilter, orderByOBject, page, limit);
      let dataReturnFinal = [];
      if (dataReturn && dataReturn.length) {
        // let videoIds: string[] = [];
        // for (let livestreamItem of dataReturn) {
        //   videoIds.push(livestreamItem?._id?.toString());
        // }
        // let dataFilterLike = {
        //   livestream_ids: videoIds,
        //   user_id: userId,
        // };
        // let dataVideoLike = await this.livestreamLikeService.filter(dataFilterLike, {}, 1, query.limit, {
        //   livestream_id: true,
        // });
        // let dataVideoLikeIds = [];
        // if (dataVideoLike) {
        //   for (let videoLikeItem of dataVideoLike) {
        //     dataVideoLikeIds.push(videoLikeItem?.livestream_id?.toString());
        //   }
        // }
        // for (let livestreamItem of dataReturn) {
        //   if (dataVideoLikeIds.indexOf(livestreamItem._id.toString()) !== -1) {
        //     dataReturnFinal.push({ ...livestreamItem.toObject(), ...{ is_like: true, is_view: false } });
        //   } else {
        //     dataReturnFinal.push({ ...livestreamItem.toObject(), ...{ is_like: false, is_view: false } });
        //   }
        // }
      }
      //let dataCount = await this.livestreamService.count(dataToFilter);
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
  async handleGetDetailLivestream(id: string, res: Response, req: ExpressRequestDto) {
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
        let dataReturn: any = await this.livestreamService.findOne(dataToFilter);

        if (dataReturn) {
          dataReturn = dataReturn?.toObject();
          let eventObject: any = await this.eventService.findOne({ livestream_id: dataReturn?._id?.toString() });
          if (eventObject) {
            dataReturn = { ...dataReturn, ...{ event_data: eventObject?.toObject() } };
          } else {
            dataReturn = { ...dataReturn, ...{ event_data: null } };
          }
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataReturn);
        } else {
          throw new NotFoundException("Livestream is not found!");
        }
      } else {
        throw new NotFoundException("Livestream is not found!");
      }
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
  async handleUpdateLivestreamByAdmin(dataUpdate: UpdateLivestreamDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      let dataLivestream = await this.livestreamService.findById(dataUpdate._id.toString());
      if (
        dataLivestream?.user_id?._id.toString() === userObject._id.toString() ||
        (await this.userPermissionService.isHavePermission(userId, "livestream/update"))
      ) {
        let dataReturn = await this.livestreamService.update(dataUpdate);
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
  async handleDeleteLivestream(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }

      let userId = req?.user_id;
      let userPermission = await this.channelPermissionService.findOne({
        user_id: userId,
        channel_id: req?.channel_id,
      });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("mentor/list") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "mentor/list")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this action!");
      }

      let dataLivestream = await this.livestreamService.findById(id.toString());
      if (
        dataLivestream?.user_id?._id.toString() === userObject?._id.toString() ||
        (await this.userPermissionService.isHavePermission(userId, "livestream/delete"))
      ) {
        let dataReturn = await this.livestreamService.remove(id);
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
      user_avatar_thumbnail: userObject.user_avatar_thumbnail,
    };
  }

  /**
   * @author Tony Vu
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processFollowUser(dataFollow: CreateLivestreamLikeDto, req: ExpressRequestDto, res: Response) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let authCode = req?.auth_code || "";
      let videoObject = await this.livestreamService.findById(dataFollow.livestream_id);

      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }

      let dataUpdate = {
        user_id: userObject._id.toString(),
        livestream_id: dataFollow.livestream_id.toString(),
        react_type: dataFollow?.react_type,
      };
      let dataReturn = await this.livestreamLikeService.update(dataUpdate);

      //Update count Video
      let dataUpdateFilter = {
        _id: videoObject._id.toString(),
      };
      let dataUpdateCount = {
        like_number: 1,
      };

      //Process Emoij
      if (dataFollow?.react_type == "haha") {
        dataUpdateCount = { ...dataUpdateCount, ...{ "react_value.haha_value": 1 } };
      }
      if (dataFollow?.react_type == "like") {
        dataUpdateCount = { ...dataUpdateCount, ...{ "react_value.like_value": 1 } };
      }
      if (dataFollow?.react_type == "love") {
        dataUpdateCount = { ...dataUpdateCount, ...{ "react_value.love_value": 1 } };
      }
      if (dataFollow?.react_type == "care") {
        dataUpdateCount = { ...dataUpdateCount, ...{ "react_value.care_value": 1 } };
      }
      if (dataFollow?.react_type == "wow") {
        dataUpdateCount = { ...dataUpdateCount, ...{ "react_value.wow_value": 1 } };
      }
      if (dataFollow?.react_type == "sad") {
        dataUpdateCount = { ...dataUpdateCount, ...{ "react_value.sad_value": 1 } };
      }
      if (dataFollow?.react_type == "angry") {
        dataUpdateCount = { ...dataUpdateCount, ...{ "react_value.angry_value": 1 } };
      }
      await this.livestreamService.updateCount(dataUpdateFilter, dataUpdateCount);

      let dataReturnFinal = await this.livestreamLikeService.findById(dataReturn?._id?.toString(), {});
      //Send to Socket
      await this.handleSendEmoij(dataReturnFinal, authCode);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturnFinal);
    } catch (error) {
      console.log(error, "error");
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processViewUser(dataFollow: CreateLivestreamViewDto, req: ExpressRequestDto, res: Response) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let videoObject = await this.livestreamService.findById(dataFollow.livestream_id);
      let authCode = req?.auth_code;

      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }

      let dataFilterView = {
        user_id: userObject._id.toString(),
        livestream_id: dataFollow.livestream_id.toString(),
      };
      let isViewCount = false;

      let dataView = await this.livestreamViewService.findOne(dataFilterView);
      if (!dataView) {
        isViewCount = true;
      }

      let dataUpdate = {
        user_id: userObject._id.toString(),
        livestream_id: dataFollow.livestream_id.toString(),
        total_time: 0,
      };
      if (dataView && Number(dataView.total_time) > Number(dataFollow.total_time)) {
        dataUpdate = { ...dataUpdate, ...{ total_time: Number(dataView.total_time) } };
      } else {
        dataUpdate = { ...dataUpdate, ...{ total_time: Number(dataFollow.total_time) } };
      }

      //Update count Video
      let dataUpdateFilter = {
        _id: videoObject._id.toString(),
      };
      await this.livestreamService.updateCount(dataUpdateFilter, { view_number: dataFollow?.view_number });

      let dataReturn = await this.livestreamViewService.update(dataUpdate);
      //Update when is New

      await this.handleSendView(dataReturn, authCode);
      //Send to Socket
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async handleSendView(dataJson: any, auth: string) {
    let dataToUpdate = {
      view: JSON.stringify(dataJson),
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
      .post(urlLogin + "/livestream-view", params, config)
      .then((response) => {
        if (response?.data) {
          //this.logger.log("Send Message Successfully" + JSON.stringify(response.data));
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        //this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
        return false;
      });
    return dataNotification;
  }

  /**
   *
   * @param fromUser
   * @param dataRequest
   * @returns
   */
  async handleSendNotificationToAllNow(
    fromUser: User,
    dataLivestream: Livestream,
    authCode: string = "",
    channelObject: any = {},
    req: ExpressRequestDto
  ) {
    try {
      let fromUserName = fromUser.display_name ? fromUser.display_name : fromUser.user_login;
      //Title
      let titleNotification = "NGAY LÚC NÀY!!!";
      let descriptionNotification = `${fromUserName} đang phát trực tiếp, truy cập ngay để không bỏ lỡ.`;
      if (descriptionNotification && descriptionNotification.length >= 255) {
        descriptionNotification = descriptionNotification.substring(0, 250) + "...";
      }

      let userIdArray = [];
      let channelId = dataLivestream?.channel_id?.toString();
      let emailArray = [];
      if (channelId) {
        for (let itemPage: number = 1; itemPage <= 10; itemPage++) {
          let allUser = await this.channelPermissionService.filter({ channel_id: channelId }, {}, itemPage, 1000);
          for (let itemUser of allUser) {
            if (itemUser?.user_id?._id) {
              userIdArray.push(itemUser?.user_id?._id?.toString());
              let userEmail = itemUser?.user_id?.user_email;
              if (userEmail) {
                emailArray.push(itemUser?.user_id);
              }
            }
          }
          if (!allUser?.length) {
            break;
          }
        }
      }

      //Update Email
      let dataFirestore = getFirestore();

      for (let emailItem of emailArray) {
        //Let dataToUpdate
        let dataToUpdate = {
          brand_name: "Gamifa",
          channel: channelObject?.name?.toString(),
          post_name: dataLivestream.title,
          channel_id: req?.channel_id,
          //@ts-ignore
          post_image: dataLivestream?.avatar?.media_url || "",
          email: emailItem?.user_email,
          fullname: emailItem.display_name,
          user_id: fromUser?._id?.toString(),
          post_url: (channelObject?.domain || "https://gamifa.vn") + "/r/live-room/" + dataLivestream?._id,
          event_name: "livestream-now",
          is_send_email: false,
        };

        //Update
        const dataUserStore = dataFirestore.collection("Users");
        await dataUserStore
          .add(dataToUpdate)
          .then(() => {
            console.log("User added!");
          })
          .catch((error) => {
            console.log(error);
          });
      }

      if (userIdArray && userIdArray?.length) {
        let dataToSendNotification = {
          request_id: dataLivestream?._id?.toString(),
          path: "/r/live-room/",
          data_id: dataLivestream?._id?.toString(),
        };
        let dataNotification = {
          createdBy: fromUser._id.toString(),
          user_id: userIdArray,
          title: titleNotification,
          content: descriptionNotification,
          param: JSON.stringify(dataToSendNotification),
          request_id: dataLivestream?._id?.toString(),
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
      console.log(error, "error");
      return false;
    }
  }

  /**
   *
   * @param fromUser
   * @param dataRequest
   * @returns
   */
  async handleSendNotificationToAllCreate(
    fromUser: User,
    dataLivestream: Livestream,
    authCode: string = "",
    channelObject: any = {},
    req: ExpressRequestDto
  ) {
    try {
      let fromUserName = fromUser.display_name ? fromUser.display_name : fromUser.user_login;
      //Title
      let titleNotification = "SỰ KIỆN ĐẶC BIỆT";
      let descriptionNotification = `${fromUserName} vừa thêm livestream ${dataLivestream?.title}. Click tham gia ngay để không bỏ lỡ! `;
      if (descriptionNotification && descriptionNotification.length >= 255) {
        descriptionNotification = descriptionNotification.substring(0, 250) + "...";
      }

      let userIdArray = [];
      let channelId = channelObject?._id?.toString();
      let emailArray = [];
      if (channelId) {
        for (let itemPage: number = 1; itemPage <= 10; itemPage++) {
          let allUser = await this.channelPermissionService.filter({ channel_id: channelId }, {}, itemPage, 1000);
          for (let itemUser of allUser) {
            if (itemUser?.user_id?._id) {
              userIdArray.push(itemUser?.user_id?._id?.toString());
              let userEmail = itemUser?.user_id?.user_email;
              if (userEmail) {
                emailArray.push(itemUser?.user_id);
              }
            }
          }
          if (!allUser?.length) {
            break;
          }
        }
      }

      //Update Email
      let dataFirestore = getFirestore();

      for (let emailItem of emailArray) {
        //Let dataToUpdate
        let dataToUpdate = {
          brand_name: "Gamifa",
          channel: channelObject?.name?.toString(),
          post_name: dataLivestream.title,
          //@ts-ignore
          post_image: dataLivestream?.avatar?.media_url || "",
          email: emailItem?.user_email,
          fullname: emailItem?.display_name,
          user_id: fromUser?._id?.toString(),
          post_url: (channelObject?.domain || "https://gamifa.vn") + "/r/live-room/" + dataLivestream?._id,
          event_name: "livestream-create",
          is_send_email: false,
        };

        //Update
        const dataUserStore = dataFirestore.collection("Users");
        await dataUserStore
          .add(dataToUpdate)
          .then(() => {
            console.log("User added!");
          })
          .catch((error) => {
            console.log(error);
          });
      }

      if (userIdArray && userIdArray?.length) {
        let dataToSendNotification = {
          request_id: dataLivestream?._id?.toString(),
          path: "/r/live-room/",
          data_id: dataLivestream?._id?.toString(),
        };
        let dataNotification = {
          createdBy: fromUser._id.toString(),
          user_id: userIdArray,
          title: titleNotification,
          channel_id: req?.channel_id,
          content: descriptionNotification,
          param: JSON.stringify(dataToSendNotification),
          request_id: dataLivestream?._id?.toString(),
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
      console.log(error, "error");
      return false;
    }
  }

  /**
   * @author Tony Vu
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processUnFollowUser(dataFollow: CreateLivestreamLikeDto, req: ExpressRequestDto, res: Response) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let videoObject = await this.livestreamService.findById(dataFollow.livestream_id);

      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }

      let dataUpdate = {
        user_id: userObject._id.toString(),
        livestream_id: dataFollow.livestream_id.toString(),
      };

      let dataReturn = await this.livestreamLikeService.removeOne(dataUpdate);

      //Update count Video
      let dataUpdateFilter = {
        _id: videoObject._id.toString(),
      };
      await this.livestreamService.updateCount(dataUpdateFilter, { like_number: -1 });
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
   * @param req
   * @param res
   * @param createLivestreamCommentDto
   */
  async createNewComment(
    createLivestreamCommentDto: CreateLivestreamCommentWithMediaDto,
    req: ExpressRequestDto,
    res: Response
  ) {
    let currentTime = new Date();
    let userObject = req?.user_object;
    if (!userObject) {
      throw new BadRequestException("User is not invalid");
    }
    let authCode = req?.auth_code;

    //Validate Chat

    //Check Livestream

    let dataLivestream = await this.livestreamService.findById(createLivestreamCommentDto.livestream_id);
    if (!dataLivestream) {
      throw new BadRequestException("Livestream is not invalid");
    }

    //Prepare Media Data
    let dataMediaResult: any = {
      media_array: [],
      data_object: [],
      is_call: false,
    };
    if (!createLivestreamCommentDto.chat_content && !createLivestreamCommentDto.media_data) {
      throw new BadRequestException("Data input is not invalid");
    }

    if (createLivestreamCommentDto.media_data) {
      try {
        let dataMediaArray = JSON.parse(createLivestreamCommentDto.media_data);
        dataMediaResult = await this.handleMediaData(dataMediaArray, createLivestreamCommentDto.livestream_id);
      } catch (error) {
        throw new NotAcceptableException("Media data input not valid!");
      }
    }
    let chatContent = createLivestreamCommentDto.chat_content ? createLivestreamCommentDto.chat_content : "";
    let dataCreate = {
      user_type: "customer",
      parent_id: createLivestreamCommentDto.parent_id ? createLivestreamCommentDto.parent_id : null,
      livestream_id: createLivestreamCommentDto.livestream_id,
      chat_content: chatContent,
      chat_type: "",
      chat_status: "send",
      createBy: userObject._id.toString(),
      send_at: currentTime.toUTCString(),
      read_at: currentTime.toUTCString(),
      media_ids: dataMediaResult.media_array,
    };

    let dataChat = await this.livestreamCommentService.create(dataCreate);

    let dataReturn = {
      ...dataChat.toObject(),
      ...{ media_ids: dataMediaResult.data_object },
      ...{
        createBy: await this.handleGetUserBase(userObject),
      },
    };

    //Update count
    await this.livestreamService.updateCount({ _id: createLivestreamCommentDto.livestream_id }, { comment_number: 1 });

    this.handleSendMessage(dataReturn, authCode);
    return res
      .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count, X-Is-Count" })
      .status(HttpStatus.OK)
      .json(dataReturn);
  }

  async handleSendMessage(message: any, auth: string) {
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
      .post(urlLogin + "/livestream-comment", params, config)
      .then((response) => {
        if (response?.data) {
          //this.logger.log("Send Message Successfully" + JSON.stringify(response.data));
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        //this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
        return false;
      });
    return dataNotification;
  }

  async handleSendEmoij(dataJson: any, auth: string) {
    let dataToUpdate = {
      emoji: JSON.stringify(dataJson),
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
      .post(urlLogin + "/livestream-emoji", params, config)
      .then((response) => {
        if (response?.data) {
          //this.logger.log("Send Message Successfully" + JSON.stringify(response.data));
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        //this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
        return false;
      });
    return dataNotification;
  }

  async handleSendEmitOffer(dataJson: any, auth: string) {
    let dataToUpdate = {
      data: JSON.stringify(dataJson),
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
      .post(urlLogin + "/emit-offer", params, config)
      .then((response: any) => {
        if (response?.data) {
          //this.logger.log("Send Message Successfully" + JSON.stringify(response.data));
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        //this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
        return false;
      });
    return dataNotification;
  }

  async handleUpdateEndLivestream(message: Livestream, auth: string) {
    let dataToUpdate = {
      message: JSON.stringify(message),
    };

    await this.requestService.removeOne({ ref_id: message?._id?.toString() });

    //Update Save Video in version 1.0.0
    //When in version 1.0.1 we not have this condition!
    if (message?.input_type === "outside") {
      //Check livestream
      let urlCloudFlare = `https://api.cloudflare.com/client/v4/accounts/2cd5df15a97f55e0045d3e45eb0e62e9/stream/live_inputs/${message?.cloudflare_stream_id}/videos`;

      // const params = new URLSearchParams(dataToUpdate);
      const configCloudflare = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + process.env.CLOUDFLARE_TOKEN,
        },
      };
      // console.log(config, 'config')
      let dataLivestreamCloudflare = await axios
        .get(urlCloudFlare, configCloudflare)
        .then((response: any) => {
          return response?.data;
        })
        .catch((error) => {
          console.log(error);
          return null;
        });
      // console.log(dataLivestreamCloudflare, "dataLivestreamCloudflare");
      if (dataLivestreamCloudflare && dataLivestreamCloudflare?.result) {
        //Update livestream
        let dataUpdate = {
          history_media: dataLivestreamCloudflare?.result,
          _id: message?._id?.toString(),
        };
        let dataUdpateHistory = await this.livestreamService.update(dataUpdate);
        console.log(dataUdpateHistory, "dataUdpateHistory");
      }
    }

    const params = new URLSearchParams(dataToUpdate);
    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Authorization": auth,
      },
    };
    const urlLogin = process.env.SOCKET_API;

    let dataNotification = await axios
      .post(urlLogin + "/livestream-end", params, config)
      .then((response) => {
        if (response?.data) {
          //this.logger.log("Send Message Successfully" + JSON.stringify(response.data));
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        //this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
        return false;
      });
    return dataNotification;
  }

  async handleUpdateLeaveRoomToClient(message: any, auth: string) {
    let dataToUpdate = {
      data: JSON.stringify(message),
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
      .post(urlLogin + "/leave-room-livestream", params, config)
      .then((response) => {
        if (response?.data) {
          //this.logger.log("Send Message Successfully" + JSON.stringify(response.data));
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        //this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
        return false;
      });
    return dataNotification;
  }

  async handleUpdateStartLivestream(message: any, auth: string) {
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
      .post(urlLogin + "/livestream-start", params, config)
      .then((response) => {
        if (response?.data) {
          //this.logger.log("Send Message Successfully" + JSON.stringify(response.data));
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        //this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
        return false;
      });
    return dataNotification;
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

    let dataSortBy = {};
    let projection = {
      media_url_presign: false,
      chat_history_id: false,
      chat_room_id: false,
      createBy: false,
      createdAt: false,
      updatedAt: false,
    };
    let mediaObjectArray = await this.chatMediaService.filter(dataFilter, dataSortBy, 100, 0, projection);
    let mediaArray = [];
    if (mediaObjectArray) {
      for (let mediaItem of mediaObjectArray) {
        if (mediaItem?.media_type?.indexOf("call") !== -1) {
          isCall = true;
        }
        mediaArray.push(mediaItem?._id?.toString());
      }
    }
    return {
      is_call: isCall,
      media_array: mediaArray,
      data_object: mediaObjectArray,
    };
  }

  /**
   * @author Tony Vu
   * @param req
   * @param res
   * @param query
   * @param id
   * @returns
   */
  async getRoomDetail(req: ExpressRequestDto, res: Response, query: ListLivestreamCommentDto, id: string) {
    try {
      let userObject = req?.user_object;
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }
      let dataLivestream = await this.livestreamService.findById(id);
      if (!dataLivestream) {
        throw new BadRequestException("Live stream not found!");
      }

      let dataFilter = {
        livestream_id: id,
        from_id: query.from_id,
        to_id: query.to_id,
        search: query?.search,
      };
      let dataOrder = {
        createdAt: query.order_by,
      };

      let dataChat = await this.livestreamCommentService.filter(dataFilter, dataOrder, query.page, query.limit);
      if (dataChat && dataChat.length) {
        //@ts-ignore
        //let dataCount = Number(dataUserOptionObject.chat_room_id?.chat_history_count);
        let dataCount = await this.livestreamCommentService.count(dataFilter);
        // let dataCount = 0;
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
      throw new BadRequestException(error.message);
    }
  }
}
