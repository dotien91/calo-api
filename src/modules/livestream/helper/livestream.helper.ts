import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from "@nestjs/common";
import { Response } from "express";
import { Types } from "mongoose";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { MediaService } from "../../../modules/media/services/media.service";
import { NotificationHelper } from "../../../modules/notification/helper/notification.helper";
import { SocketService } from "../../../modules/socket/services/socket.service";
import { SocketPath } from "../../../modules/socket/services/socket.service.i";
import { User } from "../../../modules/user/schemas/user.schema";
import { makeRandom } from "../../../utils/utils";
import { NotificationRouter } from "../../notification/interfaces/notification.interface";
import { CreateLiveStreamProduct } from "../dto/create-livestream-product.dto";
import { CreateLivestreamDto } from "../dto/create-livestream.dto";
import { CreateLivestreamCommentWithMediaDto } from "../dto/create-livestream_comment.dto";
import { CreateLivestreamLikeDto, CreateLivestreamUnLikeDto } from "../dto/create-livestream_like.dto";
import { CreateLivestreamViewDto } from "../dto/create-livestream_view.dto";
import { ListLivestreamDto } from "../dto/list-livestream.dto";
import { ListLivestreamCommentDto } from "../dto/list-livestream_comment.dto";
import { UpdateLivestreamDto } from "../dto/update-livestream.dto";
import { Livestream } from "../schemas/livestream.schema";
import { LivestreamService } from "../services/livestream.service";
import { LivestreamCommentService } from "../services/livestream_comment.service";
import { LivestreamLikeService } from "../services/livestream_like.service";
import { LivestreamViewService } from "../services/livestream_view.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class LivestreamHelper {
  constructor(
    private livestreamService: LivestreamService,
    private mediaService: MediaService,
    private livestreamLikeService: LivestreamLikeService,
    private livestreamViewService: LivestreamViewService,
    private livestreamCommentService: LivestreamCommentService,
    private notificationHelper: NotificationHelper,
    private socketService: SocketService
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
      const userObject = req?.user_object;
      const authString = req?.auth_code;
      const userId = req?.user_id;

      createLivestreamData = {
        ...createLivestreamData,
        ...{ user_id: userId, country: userObject?.country },
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

      //Update livestream data
      dataCreate = await this.handleLiveStreamData(dataCreate);

      setTimeout(async () => {
        await this.handleSendNotificationToAllCreate(userObject, dataCreate, authString, req);
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
      const userObject = req?.user_object;
      const authString = req?.auth_code;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const firstData = await this.livestreamService.findOne({ _id: dataUpdate?._id });

      if (dataUpdate?.livestream_data) {
        try {
          dataUpdate = { ...dataUpdate, ...{ livestream_data: JSON.parse(dataUpdate?.livestream_data) } };
        } catch (error) {}
      }

      let dataCreate: any = await this.livestreamService.update(dataUpdate);
      if (dataUpdate.livestream_status === "end") {
        //Update to Socket
        await this.handleUpdateEndLivestream(dataCreate, authString);
        // await this.old_handleUpdateCloudflareData(dataCreate, 'automatic');
      }

      if (dataUpdate.livestream_status === "live") {
        //Update to Socket
        await this.handleUpdateStartLivestream(dataCreate, authString);
        //Check first status
        if (firstData?.livestream_status !== "live") {
          setTimeout(async () => {
            await this.handleSendNotificationToAllNow(userObject, dataCreate, authString, req);
          }, 500);
        }
        // await this.old_handleUpdateCloudflareData(dataCreate, 'automatic');
      }
      // NOTE: still not develop yet
      // if (firstData?.input_type != "outside") {
      //   await this.old_handleCheckLivestream(dataCreate, authString);
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
  // async old_handleCheckLivestream(dataPrepare: Livestream, authString: string) {
  //   try {
  //     //Check if dataCreate.input_type == outside
  //     if (dataPrepare?.input_type == "outside") {
  //       //Check Interval
  //       let dataCountFalse = 0;
  //       const dataInterval = setInterval(async () => {
  //         let dataCreate = await this.livestreamService.findOne({ _id: dataPrepare?._id?.toString() });
  //         //Check Status Cloud Flare
  //         const urlCloudFlare = `https://customer-xmrvysjqwvfwuq70.cloudflarestream.com/${dataCreate?.cloudflare_stream_id}/lifecycle`;

  //         // const params = new URLSearchParams(dataToUpdate);
  //         const config = {
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: "Bearer " + process.env.CLOUDFLARE_TOKEN,
  //           },
  //         };
  //         // console.log(config, 'config')
  //         const dataLivestreamCloudflare = await axios
  //           .get(urlCloudFlare, config)
  //           .then((response: any) => {
  //             return response?.data;
  //           })
  //           .catch((error) => {
  //             console.log(error);
  //             return null;
  //           });
  //         console.log(dataLivestreamCloudflare, "dataLivestreamCloudflare");
  //         if (dataLivestreamCloudflare) {
  //           //Check data
  //           if (dataLivestreamCloudflare?.live == true) {
  //             //Check current live_status
  //             if (dataCreate?.livestream_status != "wait") {
  //               //Send Emit offer
  //               if (dataCreate?.ready_status === "disconnected") {
  //                 const dataJsonToEmit = {
  //                   offer: {
  //                     payload: { status: "StartStreamSuccess" },
  //                     room_id: "livestream_" + dataCreate?._id?.toString(),
  //                   },
  //                   data_livestream: dataCreate,
  //                 };

  //                 await this.handleSendEmitOffer(dataJsonToEmit, authString);
  //                 const dataToUpdate = {
  //                   _id: dataCreate?._id?.toString(),
  //                   ready_status: "connected",
  //                 };
  //                 console.log(dataToUpdate, "dataToUpdate");
  //                 //Udpate readystatus to connected
  //                 await this.livestreamService.update(dataToUpdate);
  //               }
  //             } else {
  //               //Update start Livestream
  //               const dataToUpdate = {
  //                 _id: dataCreate?._id?.toString(),
  //                 livestream_status: "live",
  //                 ready_status: "connected",
  //               };
  //               console.log(dataToUpdate, "dataToUpdate");
  //               //Udpate readystatus to connected
  //               dataCreate = await this.livestreamService.update(dataToUpdate);
  //               await this.handleUpdateStartLivestream(dataCreate, authString);
  //             }
  //             dataCountFalse = 0;
  //           } else {
  //             dataCountFalse++;
  //             console.log(dataCountFalse, "dataCountFalse");
  //             if (dataCountFalse >= 50) {
  //               //Clear interval
  //               clearInterval(dataInterval);
  //               //Update status Livestream
  //               const dataToUpdate = {
  //                 _id: dataCreate?._id?.toString(),
  //                 ready_status: "disconnected",
  //                 livestream_status: "end",
  //               };
  //               console.log(dataToUpdate, "dataToUpdate");
  //               //Udpate readystatus to connected
  //               dataCreate = await this.livestreamService.update(dataToUpdate);
  //               await this.handleUpdateEndLivestream(dataCreate, authString);
  //             } else {
  //               if (dataCreate?.livestream_status === "live" && dataCreate?.ready_status === "connected") {
  //                 const dataToUpdate = {
  //                   _id: dataCreate?._id?.toString(),
  //                   ready_status: "disconnected",
  //                 };
  //                 console.log(dataToUpdate, "dataToUpdate");
  //                 //Udpate readystatus to connected
  //                 dataCreate = await this.livestreamService.update(dataToUpdate);
  //                 await this.handleUpdateLeaveRoomToClient(dataCreate, authString);
  //               }
  //             }
  //           }
  //         }
  //       }, 5000);
  //     }
  //   } catch (error) {
  //     //Error when update Livestream
  //     return null;
  //   }
  // }

  // async old_handleCloudflareData(dataLivestream: Livestream) {
  //   try {
  //     const urlCloudFlare =
  //       "https://api.cloudflare.com/client/v4/accounts/2cd5df15a97f55e0045d3e45eb0e62e9/stream/live_inputs";
  //     // const params = new URLSearchParams(dataToUpdate);
  //     const config = {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Bearer " + process.env.CLOUDFLARE_TOKEN,
  //       },
  //     };

  //     const dataToUpdate = {
  //       meta: { name: dataLivestream?.title },
  //       recording: { mode: "automatic" },
  //       deleteRecordingAfterDays: null,
  //     };
  //     // console.log(config, 'config')
  //     const dataLivestreamCloudflare = await axios
  //       .post(urlCloudFlare, dataToUpdate, config)
  //       .then((response) => {
  //         if (response?.data) {
  //           // console.log(response?.data, "response?.data");
  //           return response?.data;
  //           return true;
  //         } else {
  //           return null;
  //         }
  //       })
  //       .catch((error) => {
  //         // console.log(error);
  //         // console.log(error.response.data, 'data error');
  //         // this.logger.log("Send Message Error: " + JSON.stringify(error.response.data));
  //         console.log(error, "error");
  //         return null;
  //       });

  //     if (dataLivestreamCloudflare && dataLivestreamCloudflare?.result) {
  //       const whipData = dataLivestreamCloudflare?.result?.webRTC?.url || "";
  //       const whepData = dataLivestreamCloudflare?.result?.webRTCPlayback?.url || "";
  //       const cloudflareStreamId = dataLivestreamCloudflare?.result?.uid || "";
  //       let m3u8Url = dataLivestreamCloudflare?.result?.webRTCPlayback?.url;
  //       m3u8Url = m3u8Url.replace("webRTC/play", "manifest/video.m3u8");
  //       const dataUpdate = {
  //         cloudflare_stream_id: cloudflareStreamId,
  //         whip_data: whipData,
  //         whep_data: whepData,
  //         livestream_data: {
  //           rtmp_url: dataLivestreamCloudflare?.result?.rtmps?.url || "",
  //           m3u8_url: m3u8Url || "",
  //           ingest_endpoint: "",
  //           stream_key: dataLivestreamCloudflare?.result?.rtmps?.streamKey || "",
  //         },
  //         _id: dataLivestream?._id?.toString(),
  //       };
  //       return await this.livestreamService.update(dataUpdate);
  //     }
  //     return dataLivestream;
  //   } catch (error) {
  //     console.log(error);
  //     return dataLivestream;
  //   }
  // }

  async handleLiveStreamData(dataLivestream: Livestream) {
    const streamKey = makeRandom(20);
    try {
      const dataUpdate = {
        livestream_data: {
          rtmp_url: process.env.RTMP_URL || "",
          m3u8_url: process.env.M3U8_URL.replace("[code]", streamKey) || "",
          ingest_endpoint: "",
          stream_key: streamKey || "",
        },
        _id: dataLivestream?._id?.toString(),
      };
      return await this.livestreamService.update(dataUpdate);
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
  // async old_handleUpdateCloudflareData(dataLivestream: Livestream, dataRecord: string) {
  //   try {
  //     if (!dataLivestream?.cloudflare_stream_id) {
  //       return dataLivestream;
  //     }
  //     const urlCloudFlare =
  //       "https://api.cloudflare.com/client/v4/accounts/2cd5df15a97f55e0045d3e45eb0e62e9/stream/live_inputs/" +
  //       dataLivestream?.cloudflare_stream_id;

  //     const dataToUpdate = {
  //       meta: { name: dataLivestream?.title },
  //       recording: { mode: dataRecord },
  //       deleteRecordingAfterDays: null,
  //     };
  //     // const params = new URLSearchParams(dataToUpdate);
  //     const config = {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Bearer " + process.env.CLOUDFLARE_TOKEN,
  //       },
  //     };
  //     // console.log(config, 'config')
  //     const dataNotification = await axios
  //       .put(urlCloudFlare, dataToUpdate, config)
  //       .then((response) => {
  //         if (response?.data) {
  //           // console.log(response?.data, "response?.data");
  //           return response?.data;
  //           return true;
  //         } else {
  //           return null;
  //         }
  //       })
  //       .catch((error) => {
  //         return null;
  //       });
  //     return dataLivestream;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
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
      const dataReturn = await this.livestreamService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.livestreamService.count(dataToFilter);
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
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getLivestreamList(query: ListLivestreamDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

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
      const dataReturn: any = await this.livestreamService.filter(dataToFilter, orderByOBject, page, limit);
      const dataReturnFinal = [];
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
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      const dataLivestream = await this.livestreamService.findById(dataUpdate._id.toString());
      if (dataLivestream?.user_id?._id.toString() === userObject._id.toString()) {
        const dataReturn = await this.livestreamService.update(dataUpdate);
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
      const userObject = req?.user_object;

      const dataLivestream = await this.livestreamService.findById(id.toString());
      if (dataLivestream?.user_id?._id.toString() === userObject?._id.toString()) {
        const dataReturn = await this.livestreamService.remove(id);
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
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const authCode = req?.auth_code || "";
      const videoObject = await this.livestreamService.findById(dataFollow.livestream_id);

      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }

      const dataUpdate = {
        user_id: userObject._id.toString(),
        livestream_id: dataFollow.livestream_id.toString(),
        react_type: dataFollow?.react_type,
      };
      const dataReturn = await this.livestreamLikeService.update(dataUpdate);

      //Update count Video
      const dataUpdateFilter = {
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

      const dataReturnFinal = await this.livestreamLikeService.findById(dataReturn?._id?.toString(), {});
      //Send to Socket
      await this.handleSendEmoji(dataReturnFinal, authCode);
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
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const videoObject = await this.livestreamService.findById(dataFollow.livestream_id);
      const authCode = req?.auth_code;

      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }

      const dataFilterView = {
        user_id: userObject._id.toString(),
        livestream_id: dataFollow.livestream_id.toString(),
      };
      let isViewCount = false;

      const dataView = await this.livestreamViewService.findOne(dataFilterView);
      if (!dataView) {
        isViewCount = true;
      }

      let dataUpdate = {
        user_id: userObject._id.toString(),
        livestream_id: dataFollow.livestream_id.toString(),
        total_time: 0,
      };
      const dataFollowTotalTime = Number(dataFollow.total_time || 0);
      if (dataView && Number(dataView.total_time) > dataFollowTotalTime) {
        dataUpdate = { ...dataUpdate, ...{ total_time: Number(dataView.total_time || 0) } };
      } else {
        dataUpdate = { ...dataUpdate, ...{ total_time: dataFollowTotalTime } };
      }

      //Update count Video
      const dataUpdateFilter = {
        _id: videoObject._id.toString(),
      };
      await this.livestreamService.updateCount(dataUpdateFilter, { view_number: dataFollow?.view_number || 0 });

      const dataReturn = await this.livestreamViewService.update(dataUpdate);
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
    const dataToUpdate = {
      view: JSON.stringify(dataJson),
    };
    const params = new URLSearchParams(dataToUpdate);
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Authorization": auth,
    };

    const dataNotification = await this.socketService
      .send(SocketPath.LIVESTREAM_VIEW, headers, params)
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
    req: ExpressRequestDto
  ) {
    try {
      const fromUserName = fromUser.display_name ? fromUser.display_name : fromUser.user_login;
      //Title
      const titleNotification = "NGAY LÚC NÀY!!!";
      let descriptionNotification = `${fromUserName} đang phát trực tiếp, truy cập ngay để không bỏ lỡ.`;
      if (descriptionNotification && descriptionNotification.length >= 255) {
        descriptionNotification = descriptionNotification.substring(0, 250) + "...";
      }

      const userIdArray = [];
      const emailArray = [];

      // Send email
      // for (let emailItem of emailArray) {
      //   await this.emailService
      //     .send({
      //       eventName: EmailPattern.LIVESTREAM_NOW,
      //       email: emailItem?.user_email,
      //       replacePattern: {
      //         brand_name: "IELTS_HUNTER",
      //         post_name: dataLivestream.title,
      //         fullname: emailItem.display_name,
      //         user_id: fromUser?._id?.toString(),
      //         post_url: process.env.FRONTEND_URI + "/r/live-room/" + dataLivestream?._id,
      //         is_send_email: false,
      //         //@ts-ignore
      //         post_image: dataLivestream?.avatar?.media_url || "",
      //       },
      //     })
      //     .catch((e) => {
      //       console.log("Send email failed: ", e.message);
      //     });
      // }

      if (userIdArray && userIdArray?.length) {
        const dataToSendNotification = {
          request_id: dataLivestream?._id?.toString(),
          // TODO: update path
          path: "/r/live-room/",
          data_id: dataLivestream?._id?.toString(),
        };
        const dataNotification = {
          createdBy: fromUser._id.toString(),
          user_id: userIdArray,
          title: titleNotification,
          content: descriptionNotification,
          param: JSON.stringify(dataToSendNotification),
          request_id: dataLivestream?._id?.toString(),
          type_action: "link",
          router: NotificationRouter.NAVIGATION_LIST_NOTIFICATIONS_SCREEN,
          click_action: "",
          image: "",
          channel: "user",
        };
        this.notificationHelper.handleSendNotification(dataNotification, authCode);
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
    req: ExpressRequestDto
  ) {
    try {
      const fromUserName = fromUser.display_name ? fromUser.display_name : fromUser.user_login;
      //Title
      const titleNotification = "SỰ KIỆN ĐẶC BIỆT";
      let descriptionNotification = `${fromUserName} vừa thêm livestream ${dataLivestream?.title}. Click tham gia ngay để không bỏ lỡ! `;
      if (descriptionNotification && descriptionNotification.length >= 255) {
        descriptionNotification = descriptionNotification.substring(0, 250) + "...";
      }

      const userIdArray = [];
      const emailArray = [];

      // for (let emailItem of emailArray) {
      //   await this.emailService
      //     .send({
      //       eventName: EmailPattern.LIVESTREAM_CREATE,
      //       email: emailItem?.user_email,
      //       replacePattern: {
      //         brand_name: "IELTS_HUNTER",
      //         post_name: dataLivestream.title,

      //         fullname: emailItem?.display_name,
      //         user_id: fromUser?._id?.toString(),
      //         post_url: process.env.FRONTEND_URI + "/r/live-room/" + dataLivestream?._id,
      //         is_send_email: false,
      //         //@ts-ignore
      //         post_image: dataLivestream?.avatar?.media_url || "",
      //       },
      //     })
      //     .catch((e) => {
      //       console.log("Send email failed: ", e.message);
      //     });
      // }

      if (userIdArray && userIdArray?.length) {
        const dataToSendNotification = {
          request_id: dataLivestream?._id?.toString(),
          path: "/r/live-room/",
          data_id: dataLivestream?._id?.toString(),
        };
        const dataNotification = {
          createdBy: fromUser._id.toString(),
          user_id: userIdArray,
          title: titleNotification,
          content: descriptionNotification,
          param: JSON.stringify(dataToSendNotification),
          request_id: dataLivestream?._id?.toString(),
          type_action: "link",
          router: NotificationRouter.NAVIGATION_LIST_NOTIFICATIONS_SCREEN,
          click_action: "",
          image: "",
          channel: "user",
        };
        this.notificationHelper.handleSendNotification(dataNotification, authCode);
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
  async processUnFollowUser(dataFollow: CreateLivestreamUnLikeDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const videoObject = await this.livestreamService.findById(dataFollow.livestream_id);

      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }

      const dataUpdate = {
        user_id: userObject._id.toString(),
        livestream_id: dataFollow.livestream_id.toString(),
      };

      const dataReturn = await this.livestreamLikeService.removeOne(dataUpdate);

      //Update count Video
      const dataUpdateFilter = {
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
    const currentTime = new Date();
    const userObject = req?.user_object;
    if (!userObject) {
      throw new BadRequestException("User is not invalid");
    }
    const authCode = req?.auth_code;

    //Validate Chat

    //Check Livestream

    const dataLivestream = await this.livestreamService.findById(createLivestreamCommentDto.livestream_id);
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
        const dataMediaArray = JSON.parse(createLivestreamCommentDto.media_data);
        dataMediaResult = await this.handleMediaData(dataMediaArray, createLivestreamCommentDto.livestream_id);
      } catch (error) {
        throw new NotAcceptableException("Media data input not valid!");
      }
    }
    const chatContent = createLivestreamCommentDto.chat_content ? createLivestreamCommentDto.chat_content : "";
    const dataCreate = {
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

    const dataChat = await this.livestreamCommentService.create(dataCreate);

    const dataReturn = {
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
    const dataToUpdate = {
      message: JSON.stringify(message),
    };
    const params = new URLSearchParams(dataToUpdate);
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Authorization": auth,
    };

    const dataNotification = await this.socketService
      .send(SocketPath.LIVESTREAM_COMMENT, headers, params)
      .then((response) => {
        if (response?.data) {
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        return false;
      });
    return dataNotification;
  }

  async handleSendEmoji(dataJson: any, auth: string) {
    const dataToUpdate = {
      emoji: JSON.stringify(dataJson),
    };
    const params = new URLSearchParams(dataToUpdate);
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Authorization": auth,
    };
    const dataNotification = await this.socketService
      .send(SocketPath.LIVESTREAM_EMOJI, headers, params)
      .then((response) => {
        if (response?.data) {
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        return false;
      });
    return dataNotification;
  }

  async handleSendEmitOffer(dataJson: any, auth: string) {
    const dataToUpdate = {
      data: JSON.stringify(dataJson),
    };
    const params = new URLSearchParams(dataToUpdate);
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Authorization": auth,
    };

    const dataNotification = await this.socketService
      .send(SocketPath.EMIT_OFFER, headers, params)
      .then((response: any) => {
        if (response?.data) {
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        return false;
      });
    return dataNotification;
  }

  // async old_handleUpdateEndLivestream(message: Livestream, auth: string) {
  //   const dataToUpdate = {
  //     message: JSON.stringify(message),
  //   };

  //   //Update Save Video in version 1.0.0
  //   //When in version 1.0.1 we not have this condition!
  //   if (message?.input_type === "outside") {
  //     //Check livestream
  //     const urlCloudFlare = `https://api.cloudflare.com/client/v4/accounts/2cd5df15a97f55e0045d3e45eb0e62e9/stream/live_inputs/${message?.cloudflare_stream_id}/videos`;

  //     // const params = new URLSearchParams(dataToUpdate);
  //     const configCloudflare = {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Bearer " + process.env.CLOUDFLARE_TOKEN,
  //       },
  //     };
  //     // console.log(config, 'config')
  //     const dataLivestreamCloudflare = await axios
  //       .get(urlCloudFlare, configCloudflare)
  //       .then((response: any) => {
  //         return response?.data;
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //         return null;
  //       });
  //     // console.log(dataLivestreamCloudflare, "dataLivestreamCloudflare");
  //     if (dataLivestreamCloudflare && dataLivestreamCloudflare?.result) {
  //       //Update livestream
  //       const dataUpdate = {
  //         history_media: dataLivestreamCloudflare?.result,
  //         _id: message?._id?.toString(),
  //       };
  //       const dataUdpateHistory = await this.livestreamService.update(dataUpdate);
  //       console.log(dataUdpateHistory, "dataUdpateHistory");
  //     }
  //   }

  //   const params = new URLSearchParams(dataToUpdate);
  //   const headers = {
  //     "Content-Type": "application/x-www-form-urlencoded",
  //     "X-Authorization": auth,
  //   };
  //   const dataNotification = await this.socketService
  //     .send(SocketPath.LIVESTREAM_END, headers, params)
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
  //   return dataNotification;
  // }

  async handleUpdateEndLivestream(message: Livestream, auth: string) {
    const dataToUpdate = {
      message: JSON.stringify(message),
    };

    const params = new URLSearchParams(dataToUpdate);
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Authorization": auth,
    };
    const dataNotification = await this.socketService
      .send(SocketPath.LIVESTREAM_END, headers, params)
      .then((response) => {
        if (response?.data) {
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        return false;
      });
    return dataNotification;
  }

  async handleUpdateLeaveRoomToClient(message: any, auth: string) {
    const dataToUpdate = {
      data: JSON.stringify(message),
    };
    const params = new URLSearchParams(dataToUpdate);
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Authorization": auth,
    };
    const dataNotification = await this.socketService
      .send(SocketPath.LEAVE_ROOM_LIVESTREAM, headers, params)
      .then((response) => {
        if (response?.data) {
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        return false;
      });
    return dataNotification;
  }

  async handleUpdateStartLivestream(message: any, auth: string) {
    const dataToUpdate = {
      message: JSON.stringify(message),
    };
    const params = new URLSearchParams(dataToUpdate);
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Authorization": auth,
    };
    const dataNotification = await this.socketService
      .send(SocketPath.LIVESTREAM_START, headers, params)
      .then((response) => {
        if (response?.data) {
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
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
    const dataIds = [];
    for (const mediaItem of dataMediaArray) {
      const mediaId = mediaItem.id;
      dataIds.push(Number(mediaId));
    }
    const dataFilter = {
      ids: dataMediaArray,
      is_history: true,
    };
    let isCall: boolean = false;

    const dataSortBy = {};
    const projection = {
      media_url_presign: false,
      chat_history_id: false,
      chat_room_id: false,
      createBy: false,
      createdAt: false,
      updatedAt: false,
    };
    const mediaObjectArray = await this.mediaService.filter(dataFilter, dataSortBy, 100, 0, projection);
    const mediaArray = [];
    if (mediaObjectArray) {
      for (const mediaItem of mediaObjectArray) {
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
      const userObject = req?.user_object;
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }
      const dataLivestream = await this.livestreamService.findById(id);
      if (!dataLivestream) {
        throw new BadRequestException("Live stream not found!");
      }

      const dataFilter = {
        livestream_id: id,
        from_id: query.from_id,
        to_id: query.to_id,
        search: query?.search,
      };
      const dataOrder = {
        createdAt: query.order_by,
      };

      const dataChat = await this.livestreamCommentService.filter(dataFilter, dataOrder, query.page, query.limit);
      if (dataChat && dataChat.length) {
        //@ts-ignore
        //let dataCount = Number(dataUserOptionObject.chat_room_id?.chat_history_count);
        const dataCount = await this.livestreamCommentService.count(dataFilter);
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

  async sendProduct(createLivestreamProductBody: CreateLiveStreamProduct, req: ExpressRequestDto, res: Response) {
    try {
      const dataToUpdate = {
        message: JSON.stringify({
          livestream_id: createLivestreamProductBody.livestream_id,
          product_ids: createLivestreamProductBody.product_ids,
        }),
      };
      const params = new URLSearchParams(dataToUpdate);
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Authorization": req.auth_code,
      };
      await this.socketService
        .send(SocketPath.LIVESTREAM_PRODUCT, headers, params)
        .then((response) => {
          if (response?.data) {
            return true;
          } else {
            return false;
          }
        })
        .catch((error) => {
          return false;
        });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count, X-Is-Count" })
        .status(HttpStatus.OK)
        .json();
    } catch (e) {
      throw new Error(e);
    }
  }
}
