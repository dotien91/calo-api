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
  Logger,
} from "@nestjs/common";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateClockHistoryDto } from "../dto/create-clock_history.dto";
import { ClockHistoryService } from "../services/clock_history.service";
import { ListClockHistoryDto } from "../dto/list-clock_history.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateClockHistoryDto } from "../dto/update-clock_history.dto";
import { Types } from "mongoose";
import { ClockService } from "../services/clock.service";
import { ListClockDto } from "../dto/list-clock.dto";
import { CreateClockDto } from "../dto/create-clock.dto";
import { UpdateClockDto } from "../dto/update-clock.dto";
import axios from "axios";
import * as _ from "lodash";
/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class ClockHelper {
  constructor(
    private clockService: ClockService,
    private clockHistoryService: ClockHistoryService,
    private userPermissionService: UserPermissionService
  ) { }

  private readonly logger = new Logger("notification");

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewClock(createClockData: CreateClockDto, res: Response, req: ExpressRequestDto) {
    try {
      let dataCreate = await this.clockService.create(createClockData);
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
   */
  async handleSendNotificationClock() {
    try {
      let currentTime = new Date();
      let timeString = currentTime.getHours() + ':' + currentTime.getMinutes();
      let from = currentTime.toISOString();
      currentTime.setTime(currentTime.getTime() + 1000 * 60);
      let to = currentTime.toISOString();
      // console.log(from, " - ", to);
      let dataFilter = {
        from: from?.toString(),
        to: to?.toString(),
        status: "enable",
      };

      let dataClock = await this.clockService.filter(dataFilter, {}, 1, 1000);
      // console.log(dataClock, 'dataClock');
      if (dataClock && dataClock?.length) {
        let deviceSignature = [];
        for (let itemClock of dataClock) {
          deviceSignature.push(itemClock?.device_id?.device_signature);
        }
        //Send notification
        this.handleSendNotificationAndroid(deviceSignature, timeString);
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleSendNotificationAndroid(deviceIds: string[], timeString: string) {
    try {
      deviceIds = _.uniq(deviceIds);

      if (deviceIds && deviceIds.length) {
        let dataNotification = {
          title: "Alarm " + timeString,
          content: "Alarm " + timeString,
          param: JSON.stringify({}),
          type_action: "screen",
          alarm: "true",
          image: "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com/2023/03/02_1677728786721/62eca202693ce49299eb697b/REM.png",
          channel: "user",
          param_string: "",
        };

        //Send Notification
        let data = {
          notification: {
            title: "",
            body: dataNotification.content,
            icon: dataNotification.image,
            image: dataNotification.image,
            type_action: dataNotification.type_action,
          },
          android: {
            priority: "high",
          },
          priority: "high",
          data: { ...dataNotification, ...{ type_action: dataNotification.type_action } },
          icon: dataNotification.image,
        };
        data = {
          ...data,
          ...{
            registration_ids: deviceIds,
          },
        };
        const config = {
          headers: {
            Authorization: `Bearer ${process.env.FIREBASE_SEND_NOTIFICATION_KEY}`,
            "Content-Type": "application/json",
          },
        };
        const urlLogin = "https://fcm.googleapis.com/fcm/send";
        let dataReturn = await axios
          .post(urlLogin, JSON.stringify(data), config)
          .then((response) => {
            if (response?.data) {
              this.logger.log("Send Notification Successfully: " + JSON.stringify(response.data));
              return true;
            } else {
              this.logger.log("Send Notification Error: NOT HAVE DATA " + JSON.stringify(response));
              return false;
            }
          })
          .catch((error) => {
            this.logger.log("Send Notification Error: " + JSON.stringify(error));
            return false;
          });
        return dataReturn;
      }
    } catch (error) {
      this.logger.log("Send Notification Error: " + JSON.stringify(error));
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
  async getClockListByUser(query: ListClockDto, res: Response, req: ExpressRequestDto) {
    try {
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
      let dataReturn = await this.clockService.filter(dataToFilter, orderByOBject, page, limit);
      let dataCount = await this.clockService.count(dataToFilter);
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
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleGetDetailClock(id: string, res: Response, req: ExpressRequestDto) {
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
        throw new ForbiddenException("Not found!");
      }
      let dataReturn = await this.clockService.findOne(dataToFilter);
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
  async handleUpdateClockByAdmin(dataUpdate: UpdateClockDto, res: Response, req: ExpressRequestDto) {
    try {
      let dataReturn = await this.clockService.update(dataUpdate);
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
  async handleDeleteClock(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let dataReturn = await this.clockService.remove(id);
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
  async createNewClockHistory(createClockHistoryData: CreateClockHistoryDto, res: Response, req: ExpressRequestDto) {
    try {
      let dataToAdd: any = createClockHistoryData;
      let dataCreate: any = await this.clockHistoryService.create(dataToAdd);

      if (dataCreate) {
        let dataToUpdate = {
          _id: createClockHistoryData?.clock_id,
          last_clock_history: dataCreate?._id?.toString(),
        };
        await this.clockService.update(dataToUpdate);
      }
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
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getClockHistoryListByUser(query: ListClockHistoryDto, res: Response, req: ExpressRequestDto) {
    try {
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
      let dataReturn = await this.clockHistoryService.filter(dataToFilter, orderByOBject, page, limit);
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
  async handleGetDetailClockHistory(id: string, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      let dataReturn = await this.clockHistoryService.findById(id.toString());
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
  async removeClockHistory(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let dataReturn = await this.clockHistoryService.remove(id);
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
  async handleUpdateClockHistoryByAdmin(dataUpdate: UpdateClockHistoryDto, res: Response, req: ExpressRequestDto) {
    try {
      let dataToAdd: any = dataUpdate;

      let dataReturn = await this.clockHistoryService.update(dataToAdd);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
