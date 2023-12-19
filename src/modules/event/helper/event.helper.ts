import { ForbiddenException, BadRequestException, HttpStatus, NotFoundException, Injectable } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { CreateEventDto } from "../dto/create.event.dto";
import { CreateEventTypeDto } from "../dto/create.event_type.dto";
import { SearchEventDto } from "../dto/search.event.dto";
import { UpdateEventDto } from "../dto/update.event.dto";
import { EventService } from "../services/event.service";
import { EventTypeService } from "../services/event_type.service";
import { Types } from "mongoose";
import { CreateUserFollowDto } from "../../../modules/user/dto/create-user_follow.dto";
import * as _ from "lodash";
import { UserService } from "../../../modules/user/services/user.service";
import { UserFollowEventService } from "../services/user_follow_event.service";
import { CreateUserFollowEventDto } from "../dto/create-user_follow_event.dto";
import { Event } from "../schemas/event.schema";
import { EventIndexService } from "../services/event_index.service";
import { SearchEventLikeDto } from "../dto/search.event_like.dto";
import { ChannelPermissionService } from "../../../modules/channel/services/channel_permission.service";
import { EventHookNotificationService } from "../../../modules/hook/services/hook_notification.service";
import { ChannelService } from "../../../modules/channel/services/channel.service";
import { CourseLikeService } from "../../../modules/course/services/course_like.service";
import { CourseLike } from "../../../modules/course/schemas/course_like.schema";

/**
 * @author Tony Vu
 * @class MapHelper
 */
@Injectable()
export class EventHelper {
  constructor(
    private readonly userPermissionService: UserPermissionService,
    private readonly eventService: EventService,
    private readonly eventTypeService: EventTypeService,
    private readonly appUserService: UserService,
    private readonly userFollowEventService: UserFollowEventService,
    private readonly eventIndexService: EventIndexService,
    private readonly channelPermissionService: ChannelPermissionService,
    private readonly eventHookNotificationService: EventHookNotificationService,
    private readonly channelService: ChannelService,
    private readonly courseLikeService: CourseLikeService
  ) {}

  async handleSearch(query: SearchEventDto, req: ExpressRequestDto, res: Response) {
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

      let headerObject = req?.headers;
      let channelId: string = "";
      if (headerObject && headerObject["x-channel"]) {
        channelId = headerObject["x-channel"]?.toString();
      }

      if (channelId) {
        dataToFilter = { ...dataToFilter, ...{ channel_id: channelId } };
      }

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      if (dataToFilter?.date) {
        //Get data Date
        let dataIndexFilter = {
          date: dataToFilter?.date?.toString(),
        };
        let dataObject = await this.eventIndexService.filter(dataIndexFilter, {}, 1, 10000);

        if (dataObject && dataObject?.length) {
          let dataArrayString = dataObject?.map((value) => {
            return value?.event_id?.toString();
          });
          dataToFilter = { ...dataToFilter, ...{ event_ids: dataArrayString } };
        }
      }

      let dataReturn = await this.eventService.filter(dataToFilter, orderByOBject, page, limit);
      let countEvent = await this.eventService.count(dataToFilter);

      let dataFinalReturn = [];

      let dataObjectFollowIds = [];

      if (query?.auth_id) {
        let dataEventIds: string[] = dataReturn?.map((value) => {
          return value?._id?.toString();
        });
        let dataFollowFilter = {
          user_id: query?.auth_id,
          event_ids: dataEventIds,
        };
        let dataObjectFollow = await this.userFollowEventService.filter(dataFollowFilter, {}, 1, 1000);
        dataObjectFollowIds = dataObjectFollow?.map((value) => {
          return value?.event_id?._id?.toString();
        });
      }
      if (dataReturn && dataReturn.length) {
        for (let dataPrepareItem of dataReturn) {
          let isFollow = false;
          let followUserObject = [];
          //Check follow
          if (query?.auth_id) {
            if (dataObjectFollowIds?.indexOf(dataPrepareItem?._id?.toString()) !== -1) {
              isFollow = true;
            }
          }

          let dataToPush = { ...dataPrepareItem, ...{ is_like: isFollow } };
          if (dataToFilter?.date) {
            //Get Date Object
            let dataToFindEventTime = {
              event_id: dataPrepareItem?._id?.toString(),
              date: dataToFilter?.date?.toString(),
            };
            let dataObject = await this.eventIndexService.filter(dataToFindEventTime, {}, 1, 10000);
            dataToPush = { ...dataToPush, ...{ event_time: dataObject } };
          }
          dataFinalReturn.push(dataToPush);
        }
      }

      let dataCourseArray = dataFinalReturn.filter((itemFilter: Event, index: number) => {
        if (itemFilter?.event_course) {
          return true;
        } else {
          return false;
        }
      });

      if (dataCourseArray?.length) {
        let dataCourseIds = dataCourseArray.map((itemCourse: Event, index: number) => {
          return itemCourse?.event_course?._id?.toString();
        });
        //Get Course Join
        if (req?.user_id) {
          let dataJoinCourse = await this.courseLikeService.filter(
            { course_ids: dataCourseIds, user_id: req?.user_id },
            {},
            1,
            1000
          );
          let dataToCheck = dataJoinCourse?.map((dataCourseJoin: CourseLike, index: number) => {
            return dataCourseJoin?.course_id?.toString();
          });
          for (let itemReturnIndex in dataFinalReturn) {
            // console.log(dataFinalReturn[itemReturnIndex]?.event_course, 'dataFinalReturn[itemReturnIndex]?.event_course')
            if (!dataFinalReturn[itemReturnIndex]?.event_course) {
              continue;
            }
            //Check course
            if (dataToCheck.indexOf(dataFinalReturn[itemReturnIndex]?.event_course?._id?.toString()) !== -1) {
              dataFinalReturn[itemReturnIndex].event_course = {
                ...dataFinalReturn[itemReturnIndex]?.event_course,
                ...{ is_join: true },
              };
            } else {
              dataFinalReturn[itemReturnIndex].event_course = {
                ...dataFinalReturn[itemReturnIndex]?.event_course,
                ...{ is_join: false },
              };
            }
          }
        }
      }

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": countEvent })
        .status(HttpStatus.OK)
        .json(dataFinalReturn);
      // } else {
      //   throw new BadRequestException("You haven't permission for this Action!");
      // }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param query
   * @param req
   * @param res
   * @returns
   */
  async handleSearchLike(query: SearchEventLikeDto, req: ExpressRequestDto, res: Response) {
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
      if (dataToFilter?.auth_id) {
        dataToFilter = { ...dataToFilter, ...{ user_id: dataToFilter?.auth_id } };
        delete dataToFilter?.auth_id;
      }

      let dataReturn = await this.userFollowEventService.filter(dataToFilter, orderByOBject, page, limit);
      let dataCount = await this.userFollowEventService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
      // } else {
      //   throw new BadRequestException("You haven't permission for this Action!");
      // }
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
  async createNewEvent(createEventData: CreateEventDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let newCreateEvent = await this.processEventData(createEventData);

      newCreateEvent = { ...newCreateEvent, ...{ user_id: userObject?._id } };

      let headerObject = req?.headers;
      let channelId: string = "";
      if (headerObject && headerObject["x-channel"]) {
        channelId = headerObject["x-channel"]?.toString();
      }

      let userId = req?.user_id;
      let userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
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

      if (channelId) {
        newCreateEvent = { ...newCreateEvent, ...{ channel_id: channelId } };
      }

      let dataCreate = await this.eventService.create(newCreateEvent);
      let dataReturn = await this.eventService.findById(dataCreate?._id?.toString());

      //If have is_recurring
      if (Number(createEventData?.is_recurring) && createEventData?.repeat_every) {
        setTimeout(async () => {
          await this.handleProcessRecurring(dataReturn);
        }, 100);
      } else {
        let dataCreate = {
          event_id: dataReturn?._id?.toString(),
          event_date: new Date(dataReturn?.open_date?.toString())?.toISOString(),
        };
        await this.eventIndexService.create(dataCreate);
      }
      let channel = await this.channelService.findById(channelId);

      setTimeout(async () => {
        // if (channel?.user_id?._id.toString() === userObject?._id.toString()) {
        //   let channelUserPermissions = await this.channelPermissionService.filter({
        //     channel_id: dataReturn?.channel_id?.toString()
        //   }, {}, 1, 9999999)
        //   for (let userPermission of channelUserPermissions) {
        //     this.eventHookNotificationService.sendNotiNMailNewEvent({
        //       user_id: userPermission?.user_id?._id.toString(),
        //       channel_id: dataReturn?.channel_id?.toString(),
        //       path: `/r/event/detail/${dataCreate._id.toString()}`,
        //       mail_template: "create_new_event",
        //       content: (params: any) => {
        //         return `${userObject.display_name} vừa tạo sự kiện ${createEventData.title} kênh ${params?.channel_name}`;
        //       },
        //       title: `${userObject.display_name.toLocaleUpperCase()} SẮP BẮT ĐẦU SỰ KIỆN  ${createEventData.title.toLocaleUpperCase()}`,
        //     })
        //   }
        //   this.eventHookNotificationService.sendNotiNMailBeforeStartEvent({
        //     start_date: new Date(createEventData.open_date),
        //     list_user_id: channelUserPermissions.map((x) => {
        //       return x?.user_id?._id.toString()
        //     }),
        //     channel_id: dataReturn?.channel_id?.toString(),
        //     path: `/r/event/detail/${dataCreate._id.toString()}`,
        //     mail_template: "before_start_event",
        //     content: (params: any) => {
        //       return `Sự kiện ${createEventData.title} của ${userObject.display_name} tại kênh ${params?.channel_name}`;
        //     },
        //     title: `${createEventData.title.toLocaleUpperCase()} SẮP BẮT ĐẦU `,
        //     event_name: createEventData.title
        //   });
        // }
      }, 500);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      console.log(error);
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param dataEvent
   */
  async handleProcessRecurring(dataEvent: Event) {
    try {
      let intervalDay = dataEvent.repeat_every;
      let endDate = dataEvent?.end_date;
      let endDateObject: Date = null;
      let startDate = dataEvent?.open_date;
      let startDateObject: Date = null;
      if (startDate) {
        startDateObject = new Date(startDate?.toString());
      } else {
        startDateObject = new Date();
      }
      if (endDate) {
        endDateObject = new Date(endDate?.toString());
      } else {
        //End Date
        let currentYear = new Date().getFullYear();
        let endDateYear = currentYear + 3;
        endDateObject = new Date(`${endDateYear}-12-31 23:59:59`);
      }

      let difference = endDateObject.getTime() - startDateObject.getTime();
      let totalDay = Math.ceil(difference / (1000 * 3600 * 24));

      if (totalDay < parseInt(dataEvent?.repeat_every?.toString())) {
        return null;
      } else {
        let newCloneDate = startDateObject;
        let dataCount = 0;
        for (
          var d = new Date(newCloneDate?.toISOString());
          d <= endDateObject;
          d.setDate(d.getDate() + parseInt(dataEvent?.repeat_every?.toString()))
        ) {
          dataCount++;
          if (dataCount >= 1095) {
            continue;
          }
          //daysOfYear.push(new Date(d));
          //Update to Data
          if (dataEvent?.repeat_on && dataEvent?.repeat_on?.length) {
            //Get current
            let dataRepeatArray = await this.handleGetDayNameFormText(dataEvent?.repeat_on);

            var curr = new Date(d); // get current date
            var first = curr.getDate() - curr.getDay();

            for (let dayName = 0; dayName <= 6; dayName++) {
              let checkDay = first + dayName;
              if (dataRepeatArray.indexOf(dayName) !== -1) {
                let dataDateToCheck = new Date(curr.setDate(checkDay));
                if (dataDateToCheck >= startDateObject && dataDateToCheck <= endDateObject) {
                  let dataCreate = {
                    event_id: dataEvent?._id?.toString(),
                    event_date: dataDateToCheck?.toISOString(),
                  };
                  await this.eventIndexService.create(dataCreate);
                }
              }
            }
          } else {
            let dataDateToCreate = new Date(d);
            let dataCreate = {
              event_id: dataEvent?._id?.toString(),
              event_date: dataDateToCreate?.toISOString(),
            };
            await this.eventIndexService.create(dataCreate);
          }
        }
      }
    } catch (error) {
      return error;
    }
  }

  /**
   *
   * @param dataArray
   */
  async handleGetDayNameFormText(dataArray: String[]) {
    try {
      let dataReturn = [];
      for (let dataItem of dataArray) {
        if (dataItem == "sunday") {
          dataReturn.push(0);
        }
        if (dataItem == "monday") {
          dataReturn.push(1);
        }
        if (dataItem == "tuesday") {
          dataReturn.push(2);
        }
        if (dataItem == "wednesday") {
          dataReturn.push(3);
        }
        if (dataItem == "thursday") {
          dataReturn.push(4);
        }
        if (dataItem == "friday") {
          dataReturn.push(5);
        }
        if (dataItem == "saturday") {
          dataReturn.push(6);
        }
      }
      return dataReturn;
    } catch (error) {
      return [];
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleGetDetailEvent(query: SearchEventDto, id: string, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      let dataReturn: any = await this.eventService.findByIdPopulate(id.toString());

      if (req?.user_id) {
        let dataFollowFilter = {
          user_id: req?.user_id,
          event_id: dataReturn?._id?.toString(),
        };
        let dataObjectFollow = await this.userFollowEventService.findOne(dataFollowFilter);

        if (dataObjectFollow) {
          dataReturn = { ...dataReturn?.toObject(), ...{ is_like: true } };
        } else {
          dataReturn = { ...dataReturn?.toObject(), ...{ is_like: false } };
        }
      }

      if (dataReturn) {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new NotFoundException("Event not exist!");
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
  async handleUpdateEventByAdmin(dataUpdate: UpdateEventDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let userId = userObject._id.toString();

      let requestObject = await this.eventService.findById(dataUpdate?._id);
      let channelId = requestObject.channel_id;
      let userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("event/update") !== -1)
      ) {
        havePermission = true;
      }
      if (requestObject?.user_id?.toString() == userId) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "request/delete")) {
        havePermission = true;
      }

      if (havePermission) {
        let newCreateEvent = await this.processEventData(dataUpdate);
        delete dataUpdate?.latitude;
        delete dataUpdate?.longitude;
        let dataReturn = await this.eventService.update(newCreateEvent);

        //Data
        //If have is_recurring
        if (dataUpdate?.open_date) {
          await this.eventIndexService.removeOne({ event_id: dataReturn?._id?.toString() });
          let dataCreate = {
            event_id: dataReturn?._id?.toString(),
            event_date: new Date(dataReturn?.open_date?.toString())?.toISOString(),
          };
          await this.eventIndexService.create(dataCreate);
        }
        if (dataUpdate?.is_recurring && dataUpdate?.repeat_every) {
          setTimeout(async () => {
            await this.eventIndexService.removeOne({ event_id: dataReturn?._id?.toString() });
            await this.handleProcessRecurring(dataReturn);
          }, 100);
        }
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
    } catch (error) {
      throw new NotFoundException(JSON.stringify(error));
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async removeEvent(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }

      let userId = userObject._id.toString();

      let requestObject = await this.eventService.findById(id);
      let channelId = requestObject.channel_id;
      let userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("event/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (requestObject?.user_id?.toString() == userId) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "request/delete")) {
        havePermission = true;
      }

      if (havePermission) {
        //Check Permission
        let dataReturn = await this.eventService.remove(id);
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

  async processEventData(createEventData: any) {
    if (createEventData.hash_tag) {
      createEventData = { ...createEventData, ...{ hash_tag: JSON.parse(createEventData.hash_tag) } };
    } else {
      delete createEventData.hash_tag;
    }

    if (createEventData.address) {
      createEventData = { ...createEventData, ...{ address: JSON.parse(createEventData.address) } };
    } else {
      delete createEventData.address;
    }

    if (createEventData.public_album) {
      createEventData = { ...createEventData, ...{ public_album: JSON.parse(createEventData.public_album) } };
    } else {
      delete createEventData.public_album;
    }

    if (createEventData.repeat_on) {
      createEventData = { ...createEventData, ...{ repeat_on: JSON.parse(createEventData.repeat_on) } };
    } else {
      delete createEventData.repeat_on;
    }

    if (createEventData.type) {
      let newId = new Types.ObjectId(createEventData.type);
      if (!newId) {
        throw new BadRequestException("Type is Note Object ID");
      }
      createEventData = { ...createEventData, ...{ type: newId } };
    }

    if (createEventData.city) {
      let newId = new Types.ObjectId(createEventData.city);
      if (!newId) {
        throw new BadRequestException("City is Note Object ID");
      }
      createEventData = { ...createEventData, ...{ city: newId } };
    }

    if (createEventData.latitude && createEventData.longitude) {
      createEventData = {
        ...createEventData,
        ...{
          loc: {
            type: "Point",
            coordinates: [
              parseFloat(createEventData.longitude.toString()),
              parseFloat(createEventData.latitude.toString()),
            ],
          },
        },
      };
    }
    return createEventData;
  }

  /**
   * @author Tony Vu
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processFollowUser(dataFollow: CreateUserFollowEventDto, req: ExpressRequestDto, res: Response) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let dataUpdate = {
        user_id: userObject._id.toString(),
        event_id: dataFollow.event_id.toString(),
      };
      let dataFollowUpdate = [dataFollow.event_id.toString()];
      if (userObject?.follow_users) {
        dataFollowUpdate = _.union(userObject?.follow_event, dataFollowUpdate);
      }
      let dataToUpdate = {
        _id: userObject._id.toString(),
        follow_event: dataFollowUpdate,
      };
      //Update Follow User
      await this.appUserService.update(dataToUpdate);
      await this.eventService.handleUpdateInc(dataFollow.event_id.toString(), true);

      //Count Like
      let dataReturn = await this.userFollowEventService.update(dataUpdate);
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
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processUnFollowUser(dataFollow: CreateUserFollowEventDto, req: ExpressRequestDto, res: Response) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let dataFindOne = {
        user_id: userObject._id.toString(),
        event_id: dataFollow.event_id.toString(),
      };
      let dataToCheck = await this.userFollowEventService.findOne(dataFindOne);

      if (dataToCheck) {
        let dataReturn = await this.userFollowEventService.remove(dataToCheck._id.toString());

        if (userObject?.follow_event) {
          //dataFollowUpdate = _.union(userObject?.follow_users, dataFollowUpdate);
          let dataFollowUpdate = userObject?.follow_users?.filter((value: any, index: number) => {
            if (value?.toString() === dataFollow.event_id.toString()) {
              return false;
            } else {
              return true;
            }
          });
          let dataToUpdate = {
            _id: userObject._id.toString(),
            follow_event: dataFollowUpdate,
          };
          //Update Follow User
          await this.appUserService.update(dataToUpdate);
        } else {
          let dataToUpdate = {
            _id: userObject._id.toString(),
            follow_event: [],
          };
          //Update Follow User
          await this.appUserService.update(dataToUpdate);
        }

        await this.eventService.handleUpdateInc(dataFollow.event_id.toString(), false);

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
}
