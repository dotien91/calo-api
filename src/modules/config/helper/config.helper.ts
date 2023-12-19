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
import { CreateConfigDto } from "../dto/create-config.dto";
import { ConfigService } from "../services/config.service";
import { ListConfigDto } from "../dto/list-config.dto";
import { PlanService } from "../../../modules/plan/services/plan.service";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateConfigDto } from "../dto/update-config.dto";
import { Config } from "../schemas/config.schema";
import { SubscribeService } from "../../../modules/subscribe/services/subscribe.service";
import { HandleServiceService } from "../../../modules/plan/services/handle_service.service";
import axios from "axios";
import { JwtService } from "@nestjs/jwt";
import { ConfigService as ConfigServiceNest } from "@nestjs/config";
import { DecodeUserToken } from "../../../dto/decode-user-token.dto";
import { UserService } from "../../../modules/user/services/user.service";
import { ChannelService } from "../../../modules/channel/services/channel.service";
import { ChatMediaService } from "../../../modules/chat_media/services/chat_media.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class ConfigHelper {
  constructor(
    private configService: ConfigService,
    private planService: PlanService,
    private userPermissionService: UserPermissionService,
    private subscribeService: SubscribeService,
    private handleServiceService: HandleServiceService,
    private userService: UserService,
    private channelService: ChannelService,
    private chatMediaService: ChatMediaService
  ) {}

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewConfig(createConfigData: CreateConfigDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      if (createConfigData.option_content) {
        createConfigData = { ...createConfigData, ...{ option_content: JSON.parse(createConfigData.option_content) } };
      }
      if (createConfigData.filter_premium) {
        createConfigData = { ...createConfigData, ...{ filter_premium: JSON.parse(createConfigData.filter_premium) } };
      }
      if (createConfigData.filter_free) {
        createConfigData = { ...createConfigData, ...{ filter_free: JSON.parse(createConfigData.filter_free) } };
      }
      if (createConfigData.data_filter) {
        createConfigData = { ...createConfigData, ...{ data_filter: JSON.parse(createConfigData.data_filter) } };
      }
      if (createConfigData.filter_pro) {
        createConfigData = { ...createConfigData, ...{ filter_pro: JSON.parse(createConfigData.filter_pro) } };
      }
      let dataCreate = await this.configService.create(createConfigData);
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
  async getConfigListByAdmin(query: ListConfigDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "config/list")) {
        if (Number(query.limit) > 1000) {
          query.limit = 1000;
        }

        let limit = query.limit ? query.limit : 1000;
        let page = query.page ? query.page : 1;
        let configByOBject = {};
        let dataToFilter = { ...query };
        delete dataToFilter.page;
        delete dataToFilter.limit;
        delete dataToFilter.order_by;
        let dataReturn = await this.configService.filter(dataToFilter, configByOBject, page, limit);
        let dataCount = await this.configService.count(dataToFilter);
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
  async getConfigListByUser(type: string, query: ListConfigDto, res: Response, req: ExpressRequestDto) {
    try {
      // let userObject = req?.user_object;
      // if (!userObject) {
      //   throw new ForbiddenException("User is invalid");
      // }
      // let userId = userObject._id.toString();

      let dataToFilter = { type: type };
      let dataReturnConfig: any = await this.configService.findOne(dataToFilter);

      // //Get Subscribe
      // let dataToFilterSubscribe = {
      //   user_id: userId,
      // };

      // let limit = 1000;
      // let page = 1;
      // let configByOBject = {};
      let dataAuth = await this.handleSession(req);
      let userVersion = 0;
      let channelVersion = 0;
      if (dataAuth && dataAuth?._id) {
        let dataUser = await this.userService.findById(dataAuth?._id?.toString(), {});
        userVersion = Number(dataUser?.user_version) || 0;
      }

      let channelId = "";
      let authCodeHeader = req?.headers || "";
      if (authCodeHeader && authCodeHeader["x-channel"]) {
        channelId = authCodeHeader["x-channel"]?.toString() || "";
      }

      let version = "1.0.0";
      if (query.version) {
        version = query.version;
      }
      let dataChannel: any = {};
      if (channelId) {
        dataChannel = await this.channelService.findById(channelId);
        channelVersion = Number(dataChannel?.channel_version) || 0;
      }
      // let dataReturnSubscribe = await this.subscribeService.filter(dataToFilterSubscribe, configByOBject, page, limit);
      let dataServices = await this.handleServiceService.filter({}, {}, 1, 100);
      let dataServiceReturn = [];
      if (dataServices && dataServices.length) {
        for (let serviceItem of dataServices) {
          if (serviceItem.handle === "pro" && version === "1.0.0") {
            dataServiceReturn.push(serviceItem);
          }
        }
        for (let serviceItem of dataServices) {
          if (serviceItem.handle === "premium") {
            dataServiceReturn.push(serviceItem);
          }
        }

        for (let serviceItem of dataServices) {
          if (serviceItem.handle === "vip" && version === "1.0.1") {
            dataServiceReturn.push(serviceItem);
          }
        }
      }
      // if (dataReturnConfig?.option_content && dataReturnConfig?.option_content?.length) {
      //   let allowUserId = ["635ba61263957762b5091dd8", "635ba13a63957762b508e1b7"];
      //   if (allowUserId.indexOf(userId) !== -1) {
      //     dataReturnConfig.option_content = [
      //       ...dataReturnConfig?.option_content,
      //       ...[{
      //         key: "is_connect_instagram",
      //         value: "1",
      //         _id: "633e54faced405b6edec56e4",
      //       }]
      //     ];
      //   }
      // }
      let dataReturn = {
        config: dataReturnConfig,
        subscribe: [],
        service: dataServiceReturn,
        chat_count: 0,
        call_count: 0,
        map_count: 0,
        user_version: userVersion,
        channel_version: channelVersion,
      };

      if (process.env.BRANCH_NAME === "esim") {
        let userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
        const ipInfoArray = process.env.IPINFO_TOKEN?.split(",");
        const random = Math.floor(Math.random() * ipInfoArray.length);
        if (userIp && ipInfoArray && ipInfoArray[random]) {
          let ipUrl = `https://ipinfo.io/${userIp}?token=${ipInfoArray[random]}`;
          let dataIp = await axios
            .get(ipUrl)
            .then((response) => {
              if (response && response.data) {
                return response.data;
              } else {
                return null;
              }
            })
            .catch((error) => {
              return null;
            });
          if (dataIp) {
            dataReturn = { ...dataReturn, ...{ country: dataIp.country, data_country: JSON.stringify(dataIp) } };
          }
        }
      }

      //Count
      if (query.hasOwnProperty("is_count_ab")) {
        let dataFilter = {
          type: "limit_ab",
        };
        let dataCount = {
          count_ab: 1,
        };
        await this.configService.updateCount(dataFilter, dataCount);
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
   * @author Tony Vu
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getDefaultAvatar(type: string, res: Response, req: ExpressRequestDto) {
    try {
      let dataFilter = {
        function_type: type,
      };
      let dataCount = await this.chatMediaService.count(dataFilter);
      let max = dataCount;
      let min = 1;
      let pageRandom = Math.floor(Math.random() * (max - min + 1)) + min;
      let dataReturn = "";
      let dataImage = await this.chatMediaService.filter(dataFilter, {}, pageRandom, 1);
      if (dataImage && dataImage?.length) {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataImage[0]);
      } else {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.NO_CONTENT)
          .json(dataReturn);
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  /**
   * @author Tony Vu
   * @param req
   * @returns
   */
  async handleSession(req: ExpressRequestDto) {
    try {
      let authCodeHeader = req?.headers;
      let authCodeString: string = "";
      if (authCodeHeader && authCodeHeader["x-authorization"]) {
        authCodeString = authCodeHeader["x-authorization"]?.toString();
      }
      if (authCodeHeader && authCodeHeader["authorization"]) {
        authCodeString = authCodeHeader["authorization"].replace("Bearer ", "");
      }

      if (authCodeHeader && authCodeHeader["authorization"]) {
        authCodeString = authCodeHeader["authorization"].replace("Bearer ", "");
      }

      let hashPassword = new ConfigServiceNest().get<string>("HASH_PASSWORD");
      const { data, exp } = (await new JwtService().verify(authCodeString, {
        secret: hashPassword,
      })) as DecodeUserToken;
      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param type
   * @param packageString
   * @param query
   * @param res
   * @param req
   * @returns
   */
  async getPackageType(
    type: string,
    packageString: string,
    query: ListConfigDto,
    res: Response,
    req: ExpressRequestDto
  ) {
    try {
      let dataToFilter = { type: type, package_name: packageString };
      let dataReturnConfig: any = await this.configService.findOne(dataToFilter);

      //If not have
      if (!dataReturnConfig) {
        //Create
        let dataToCreate = await this.getDefaultValue(type, packageString);
        let dataReturn = await this.configService.create(dataToCreate);
        let dataReturnFinal = {
          config: dataReturn,
        };

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturnFinal);
      } else {
        let dataReturn = {
          config: dataReturnConfig,
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
   * @returns
   */
  async getDefaultValue(type: string, packageString: string) {
    return {
      type: type,
      package_name: packageString,
      data_filter: [],
      data_content: "",
      near_by_free: "0",
      chat_free: "0",
      call_free: "0",
      call_pro: "0",
      follow_free: "0",
      view_today_free: "0",
      filter_free: [],
      filter_pro: [],
      filter_premium: [],
      option_content: [
        {
          key: "key_reward_ads_android",
          value: "",
          description: "Key quảng cáo Android Reward",
        },
        {
          key: "key_reward_ads_ios",
          value: "",
          description: "Key quảng cáo IOS Reward",
        },
        {
          key: "key_native_ads_android",
          value: "",
          description: "Key quảng cáo Android Native Ads",
        },
        {
          key: "key_native_ads_ios",
          value: "",
          description: "Key quảng cáo native IOS",
        },
        {
          key: "device_id_bot",
          value: "64250a90a482f9d8bd1fa18d",
          description: "Tài khoản ID Bot trả lời",
        },
        {
          key: "trial_count",
          value: "3",
          description: "Lượt để được hỏi từng câu hỏi một/ngày.",
        },
        {
          key: "key_open_ads_ios",
          value: "",
          description: "Key quảng cáo Open Ads IOS",
        },
        {
          key: "key_open_ads_android",
          value: "",
          description: "Key quảng cáo Open Ads Android",
        },
      ],
    };
  }

  /**
   * @author Tony Vu
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async checkGPTHealth(type: string, password: string, query: ListConfigDto, res: Response, req: ExpressRequestDto) {
    try {
      if (password !== "ZwJr3pUjUQ4KeBfc") {
        throw new NotFoundException("Not Working, Password not correct!");
      }
      let dataToFilter = { type: type };
      let dataReturnConfig: any = await this.configService.findOne(dataToFilter);

      let chatGPTKey = "";
      if (dataReturnConfig && dataReturnConfig?.option_content) {
        //console.log(dataReturnConfig?.option_content, 'dataReturnConfig?.option_content')
        //Check key
        for (let dataOptionContent of dataReturnConfig?.option_content) {
          if (dataOptionContent?.key == "chatgpt_key") {
            chatGPTKey = dataOptionContent?.value;
          }
        }
      }
      if (chatGPTKey) {
        var data = JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: "Hello!",
            },
          ],
        });

        var config = {
          method: "post",
          url: "https://api.openai.com/v1/chat/completions",
          headers: {
            Authorization: `Bearer ${chatGPTKey}`,
            "Content-Type": "application/json",
          },
          data: data,
        };

        let dataReturn = await axios(config)
          .then(function (response) {
            return response?.data;
          })
          .catch(function (error) {
            return null;
          });
        // console.log(dataReturn, 'dataReturn')

        if (dataReturn) {
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataReturn);
        } else {
          throw new NotFoundException("ChatGPT not working!");
        }
      } else {
        throw new NotFoundException("Not found ChatGPT Key!");
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
  async handleGetDetailConfig(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      //Check Permission
      let dataReturn = await this.configService.findById(id.toString());
      if (await this.userPermissionService.isHavePermission(userId, "config/list")) {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
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
  async handleUpdateConfigByAdmin(dataUpdate: UpdateConfigDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      //Check Permission
      if (await this.userPermissionService.isHavePermission(userId, "config/update")) {
        if (dataUpdate.option_content) {
          let dataOptionContent = JSON.parse(dataUpdate.option_content);
          let dataToUpdateOptionContent: any = [];
          for (let dataItem of dataOptionContent) {
            if (dataItem?.key) {
              dataToUpdateOptionContent.push(dataItem);
            }
          }

          dataUpdate = { ...dataUpdate, ...{ option_content: dataToUpdateOptionContent } };
        }
        if (dataUpdate.filter_premium) {
          dataUpdate = { ...dataUpdate, ...{ filter_premium: JSON.parse(dataUpdate.filter_premium) } };
        }
        if (dataUpdate.data_filter) {
          dataUpdate = { ...dataUpdate, ...{ data_filter: JSON.parse(dataUpdate.data_filter) } };
        }
        if (dataUpdate.filter_free) {
          dataUpdate = { ...dataUpdate, ...{ filter_free: JSON.parse(dataUpdate.filter_free) } };
        }
        if (dataUpdate.filter_pro) {
          dataUpdate = { ...dataUpdate, ...{ filter_pro: JSON.parse(dataUpdate.filter_pro) } };
        }
        let dataReturn = await this.configService.update(dataUpdate);
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
