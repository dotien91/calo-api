import { BadRequestException, ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService as ConfigServiceNest } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";
import { Response } from "express";
import { DecodeUserToken } from "../../../dto/decode-user-token.dto";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { HandleServiceService } from "../../../modules/plan/services/handle_service.service";
import { UserService } from "../../../modules/user/services/user.service";
import { CreateConfigDto } from "../dto/create-config.dto";
import { ListConfigDto } from "../dto/list-config.dto";
import { UpdateConfigDto } from "../dto/update-config.dto";
import { ConfigService } from "../services/config.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class ConfigHelper {
  constructor(
    private configService: ConfigService,
    private handleServiceService: HandleServiceService,
    private userService: UserService
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
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      if (createConfigData.option_content) {
        createConfigData = { ...createConfigData, ...{ option_content: JSON.parse(createConfigData.option_content) } };
      }
      if (createConfigData.data_filter) {
        createConfigData = { ...createConfigData, ...{ data_filter: JSON.parse(createConfigData.data_filter) } };
      }
      const dataCreate = await this.configService.create(createConfigData);
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
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      const configByOBject = {};
      const dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.configService.filter(dataToFilter, configByOBject, page, limit);
      const dataCount = await this.configService.count(dataToFilter);
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
  async getConfigListByUser(type: string, query: ListConfigDto, res: Response, req: ExpressRequestDto) {
    try {
      const dataToFilter = { type: type };
      const dataReturnConfig = await this.configService.findOne(dataToFilter);

      const dataAuth = await this.handleSession(req);
      const userVersion = 0;
      const channelVersion = 0;
      if (dataAuth && dataAuth?._id) {
        const dataUser = await this.userService.findById(dataAuth?._id?.toString(), {});
      }

      let channelId = "";
      const authCodeHeader = req?.headers || "";
      if (authCodeHeader && authCodeHeader["x-channel"]) {
        channelId = authCodeHeader["x-channel"]?.toString() || "";
      }

      let version = "1.0.0";
      if (query.version) {
        version = query.version;
      }

      // let dataReturnSubscribe = await this.subscribeService.filter(dataToFilterSubscribe, configByOBject, page, limit);
      const dataServices = await this.handleServiceService.filter({}, {}, 1, 100);
      const dataServiceReturn = [];
      if (dataServices && dataServices.length) {
        for (const serviceItem of dataServices) {
          if (serviceItem.handle === "pro" && version === "1.0.0") {
            dataServiceReturn.push(serviceItem);
          }
        }
        for (const serviceItem of dataServices) {
          if (serviceItem.handle === "premium") {
            dataServiceReturn.push(serviceItem);
          }
        }

        for (const serviceItem of dataServices) {
          if (serviceItem.handle === "vip" && version === "1.0.1") {
            dataServiceReturn.push(serviceItem);
          }
        }
      }

      let dataReturn = {
        config: dataReturnConfig,
        subscribe: [],
        service: dataServiceReturn,
        channel_version: channelVersion,
      };

      if (process.env.BRANCH_NAME === "esim") {
        const dataIp = await this.configService.getIpInfo(req);
        if (dataIp) {
          dataReturn = { ...dataReturn, ...{ country: dataIp.country, data_country: JSON.stringify(dataIp) } };
        }
      }

      //Count
      if (query.hasOwnProperty("is_count_ab")) {
        const dataFilter = {
          type: "limit_ab",
        };
        const dataCount = {
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
   * @param req
   * @returns
   */
  async handleSession(req: ExpressRequestDto) {
    try {
      const authCodeHeader = req?.headers;
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

      const hashPassword = new ConfigServiceNest().get<string>("HASH_PASSWORD");
      const { data } = (await new JwtService().verify(authCodeString, {
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
  async getPackageType(type: string, packageString: string, res: Response) {
    try {
      const dataToFilter = { type: type, package_name: packageString };
      const dataReturnConfig: any = await this.configService.findOne(dataToFilter);

      //If not have
      if (!dataReturnConfig) {
        //Create
        const dataToCreate = await this.getDefaultValue(type, packageString);
        const dataReturn = await this.configService.create(dataToCreate);
        const dataReturnFinal = {
          config: dataReturn,
        };

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturnFinal);
      } else {
        const dataReturn = {
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
      const dataToFilter = { type: type };
      const dataReturnConfig: any = await this.configService.findOne(dataToFilter);

      let chatGPTKey = "";
      if (dataReturnConfig && dataReturnConfig?.option_content) {
        //console.log(dataReturnConfig?.option_content, 'dataReturnConfig?.option_content')
        //Check key
        const optionContents = dataReturnConfig ? dataReturnConfig.option_content : [];
        for (const dataOptionContent of optionContents) {
          if (dataOptionContent?.key == "chatgpt_key") {
            chatGPTKey = dataOptionContent?.value;
          }
        }
      }
      if (chatGPTKey) {
        const data = JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: "Hello!",
            },
          ],
        });

        const config = {
          method: "post",
          url: "https://api.openai.com/v1/chat/completions",
          headers: {
            Authorization: `Bearer ${chatGPTKey}`,
            "Content-Type": "application/json",
          },
          data: data,
        };

        const dataReturn = await axios(config)
          .then(function (response) {
            return response?.data;
          })
          .catch(function (error) {
            console.log(error);
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
      //Check Permission
      const dataReturn = await this.configService.findById(id.toString());
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
  async handleUpdateConfigByAdmin(dataUpdate: UpdateConfigDto, res: Response, req: ExpressRequestDto) {
    try {
      if (dataUpdate.option_content) {
        const dataOptionContent = JSON.parse(dataUpdate.option_content);
        const dataToUpdateOptionContent: any = [];
        for (const dataItem of dataOptionContent) {
          if (dataItem?.key) {
            dataToUpdateOptionContent.push(dataItem);
          }
        }

        dataUpdate = { ...dataUpdate, ...{ option_content: dataToUpdateOptionContent } };
      }
      if (dataUpdate.data_filter) {
        dataUpdate = { ...dataUpdate, ...{ data_filter: JSON.parse(dataUpdate.data_filter) } };
      }
      const dataReturn = await this.configService.update(dataUpdate);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
