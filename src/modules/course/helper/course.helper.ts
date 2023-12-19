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
import { CreateCourseDto } from "../dto/create-course.dto";
import { CourseService } from "../services/course.service";
import { ListCourseDto } from "../dto/list-course.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateCourseDto } from "../dto/update-course.dto";
import { Types } from "mongoose";
import { ChatMediaService } from "../../../modules/chat_media/services/chat_media.service";
import { User } from "../../../modules/user/schemas/user.schema";
import { CreateCourseLikeDto } from "../dto/create-course_like.dto";
import { CourseLikeService } from "../services/course_like.service";
import { CourseViewService } from "../services/course_view.service";
import { CreateCourseViewDto } from "../dto/create-course_view.dto";
import { UserOptionService } from "../../../modules/user/services/user_option.service";
import * as _ from "lodash";
import { UserSessionService } from "../../../modules/user/services/user_session.service";
import { ListCourseModuleDto } from "../dto/list-course_module.dto";
import { CourseModuleService } from "../services/course_module.service";
import { CreateCourseModuleDto } from "../dto/create-course_module.dto";
import { UpdateCourseModuleDto } from "../dto/update-course_module.dto";
import { CourseView } from "../schemas/course_view.schema";
import { ChannelPermissionService } from "../../../modules/channel/services/channel_permission.service";
import { Course } from "../schemas/course.schema";
import { HandleServiceService } from "../../../modules/plan/services/handle_service.service";
import { PlanService } from "../../../modules/plan/services/plan.service";
import { CourseLike } from "../schemas/course_like.schema";
import { ChannelService } from "../../../modules/channel/services/channel.service";
import { EventHookNotificationService } from "../../../modules/hook/services/hook_notification.service";
import { ListMemberDto } from "../dto/list-member.dto";
import { EventHookWorkerService } from "../../../modules/hook/services/hook_do.service";
import { UserService } from "../../../modules/user/services/user.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class CourseHelper {
  constructor(
    private courseService: CourseService,
    private courseModuleService: CourseModuleService,
    private userPermissionService: UserPermissionService,
    private chatMediaService: ChatMediaService,
    private courseLikeService: CourseLikeService,
    private courseViewService: CourseViewService,
    private userOptionService: UserOptionService,
    private userSessionService: UserSessionService,
    private channelPermissionService: ChannelPermissionService,
    private handleServiceService: HandleServiceService,
    private planService: PlanService,
    private readonly channelService: ChannelService,
    private readonly eventHookNotificationService: EventHookNotificationService,
    private readonly hookWorker: EventHookWorkerService,
    private readonly userService: UserService
  ) {
    setTimeout(async () => {
      //await this.handleProcessModuleCount()
    }, 1000);
  }

  async handleProcessModuleCount() {
    const dataCourse = await this.courseService.filter({}, {}, 1, 1000);
    for (const dataaCourseItem of dataCourse) {
      const countChild = await this.courseModuleService.count({
        course_id: dataaCourseItem?._id?.toString(),
        is_child: "1",
      });
      const count = await this.courseModuleService.count({ course_id: dataaCourseItem?._id?.toString() });
      const dataUpdate = {
        _id: dataaCourseItem?._id?.toString(),
        module_child_count: countChild,
        module_count: count,
      };
      await this.courseService.update(dataUpdate);
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
  async createNewCourse(createCourseData: CreateCourseDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      const headerObject = req?.headers;
      let channelId: string = "";
      if (headerObject && headerObject["x-channel"]) {
        channelId = headerObject["x-channel"]?.toString();
      }

      const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
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

      createCourseData = { ...createCourseData, ...{ user_id: userId } };
      if (channelId) {
        createCourseData = { ...createCourseData, ...{ channel_id: channelId } };
      }
      const dataCreate: any = await this.courseService.create(createCourseData);
      let dataReturn: any = await this.courseService.findById(dataCreate?._id?.toString());
      if (dataReturn?.coin_value) {
        dataReturn = await this.handleUpdateServiceCourse(dataReturn);
      }
      const channel = await this.channelService.findById(channelId);

      setTimeout(async () => {
        if (channel?.user_id.toString() === userObject?._id.toString() && channelId) {
          const channelUserPermissions = await this.channelPermissionService.filter(
            {
              channel_id: channelId,
            },
            {},
            1,
            9999999
          );
          for (const userPermission of channelUserPermissions) {
            this.eventHookNotificationService.sendNotiNewCourse({
              send_user_id: req?.user_id?.toString(),
              user_id: userPermission?.user_id?._id.toString(),
              channel_id: channelId,
              path: `/r/courses/view/${dataCreate._id.toString()}`,
              mail_template: "create_new_course",
              content: (params: any) => {
                return `${userObject.display_name} vừa tạo khóa học ${createCourseData.title} kênh ${params?.channel_name}`;
              },
              title: `${userObject.display_name.toLocaleUpperCase()} ĐÃ MỞ KHÓA HỌC ${createCourseData.title.toLocaleUpperCase()}`,
            });
          }
        }
      }, 500);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleUpdateServiceCourse(courseData: Course) {
    try {
      //Check Service
      const dataServiceToAdd = {
        handle: courseData?._id?.toString(),
        title: courseData?.title?.toString(),
        channel_id: courseData?.channel_id?.toString(),
        description: courseData?.description?.toString(),
        avatar: courseData?.avatar?._id?.toString(),
        long_description: courseData?.long_description?.toString(),
        service_type: "course",
        is_show_side_bar: false,
        router_link: "r/courses/view/" + courseData?._id,
      };
      const serviceData = await this.handleServiceService.create(dataServiceToAdd);
      if (serviceData) {
        const dataPlanCreate = {
          service_id: serviceData?._id?.toString(),
          channel_id: courseData?.channel_id?.toString(),
          name: courseData?.title?.toString(),
          price: Number(courseData?.coin_value),
          amount_of_day: 365,
          trial_day: 0,
          amount_of_coin: 365,
          description: courseData?.description?.toString(),
          type: "one_time",
          image: courseData?.avatar?.media_url?.toString(),
          country: "VN",
          version: "1.0.1",
          ref_id: courseData?._id?.toString(),
          google_store_product_id: "",
        };
        const planService = await this.planService.create(dataPlanCreate);
        // console.log(planService, 'planService')

        if (planService) {
          const dataUpdate = {
            _id: courseData?._id?.toString(),
            service_id: serviceData?._id?.toString(),
            plan_id: planService?._id?.toString(),
          };
          const dataReturn = await this.courseService.update(dataUpdate);
          // console.log(dataReturn, 'dataReturn')
          return dataReturn;
        }
      }
      return {};
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  /**
   *
   * @param courseData
   * @returns
   */
  async handleUpdatePlan(courseData: Course) {
    try {
      const dataPlanCreate = {
        _id: courseData?.plan_id?.toString(),
        service_id: courseData?.service_id.toString(),
        channel_id: courseData?.channel_id?.toString(),
        name: courseData?.title?.toString(),
        price: Number(courseData?.coin_value),
        amount_of_day: 365,
        trial_day: 0,
        amount_of_coin: 365,
        description: courseData?.description?.toString(),
        type: "one_time",
        image: courseData?.avatar?.media_url?.toString(),
        country: "VN",
        version: "1.0.1",
        ref_id: courseData?._id?.toString(),
        google_store_product_id: "",
      };
      const planService = await this.planService.update(dataPlanCreate);
      return {};
    } catch (error) {
      console.log(error);
      return {};
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
  async createNewCourseModule(createCourseData: CreateCourseModuleDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      const userPermission = await this.channelPermissionService.findOne({
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
      createCourseData = { ...createCourseData, ...{ user_id: userId } };
      let dataCreate: any = await this.courseModuleService.create(createCourseData);
      dataCreate = dataCreate.toObject();
      dataCreate = {
        ...dataCreate,
        ...{
          user_id: await this.handleGetUserBase(userObject),
        },
      };
      //Count Course
      if (createCourseData?.parent_id) {
        await this.courseService.updateCount(
          { _id: createCourseData?.course_id },
          { module_count: 1, module_child_count: 1 }
        );
      } else {
        await this.courseService.updateCount({ _id: createCourseData?.course_id }, { module_count: 1 });
      }
      const dataReturn = await this.courseModuleService.findOne({ _id: dataCreate?._id?.toString() });
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
  async updateCourse(dataUpdate: UpdateCourseDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = req?.user_id;
      const userPermission = await this.channelPermissionService.findOne({
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
      //Get Media Data
      let dataCreate: any = await this.courseService.update(dataUpdate);
      if (dataCreate?.coin_value && !dataCreate?.service_id) {
        dataCreate = await this.handleUpdateServiceCourse(dataCreate);
      }
      if (dataCreate?.coin_value && dataCreate?.service_id) {
        await this.handleUpdatePlan(dataCreate);
      }
      if (!Number(dataCreate?.coin_value) && dataCreate?.service_id) {
        //Update service
        const dataUpdate = {
          service_id: null,
          plan_id: null,
          _id: dataCreate?._id?.toString(),
        };
        await this.courseService.update(dataUpdate);
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
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async updateCourseModule(dataUpdate: UpdateCourseModuleDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = req?.user_id;
      const userPermission = await this.channelPermissionService.findOne({
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

      //Get Media Data
      const dataCreate: any = await this.courseModuleService.update(dataUpdate);
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
  async getCourseListByAdmin(query: ListCourseDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "course/list")) {
        if (Number(query.limit) > 1000) {
          query.limit = 1000;
        }

        const limit = query.limit ? query.limit : 1000;
        const page = query.page ? query.page : 1;
        let orderByObject = {};
        if (query.order_by) {
          orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
        }
        const dataToFilter = { ...query };
        delete dataToFilter.page;
        delete dataToFilter.limit;
        delete dataToFilter.order_by;
        const dataReturn = await this.courseService.filter(dataToFilter, orderByObject, page, limit);
        const dataCount = await this.courseService.count(dataToFilter);
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
   * @param res
   * @param req
   * @returns
   */
  async handleGetListMember(query: ListMemberDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let sessionObject = null;
      if (req) {
        sessionObject = req?.session_data;
      }

      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query, ...{ channel_id: req?.channel_id } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      if (query?.search) {
        //Search User First
        const dataSearch = {
          search: query?.search,
          channel_permission: req?.channel_id,
        };
        const dataUserArray = await this.userService.filter(dataSearch, orderByObject, page, limit * 10);
        const ids = dataUserArray.map((itemValue, index) => {
          return itemValue?._id?.toString();
        });
        if (ids && ids.length) {
          dataToFilter = { ...dataToFilter, ...{ user_ids: ids } };
        } else {
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json([]);
        }
      }

      const dataReturn: any = await this.courseLikeService.filterCourse(dataToFilter, orderByObject, page, limit, {
        course_id: true,
      });

      let dataChannelPermission = [];
      //Get Data level
      if (req?.channel_id) {
        const dataUserIds = dataReturn?.map((value) => {
          return value?.user_id?._id?.toString();
        });
        //get permission
        const dataFilterMember = {
          channel_id: req?.channel_id,
          user_ids: dataUserIds,
        };
        dataChannelPermission = await this.channelPermissionService.filterWithoutChannel(
          dataFilterMember,
          {},
          1,
          limit
        );
      }
      for (const dataReturnItem in dataReturn) {
        //Check user
        const dataToMerge = dataChannelPermission?.reduce(function (filtered: any, value: any) {
          if (value?.user_id?._id?.toString() == dataReturn[dataReturnItem]?.user_id?._id?.toString()) {
            filtered.push({
              ...value?.user_id?.toObject(),
              ...{
                channel_role: value?.channel_role,
                coin_number: value?.coin_number,
                permission: value?.permission,
                point: value?.point,
                level_number: value?.level_number,
                user_email: dataReturn[dataReturnItem]?.user_id?.user_email,
                user_phone: dataReturn[dataReturnItem]?.user_id?.user_phone,
              },
            });
          }
          return filtered;
        }, []);

        if (dataToMerge && dataToMerge[0]) {
          dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ user_id: dataToMerge[0] } };
        }
        dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ is_like: true, is_view: false } };
      }

      const countData = await this.courseLikeService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": countData })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @author Tony Vu
   * @param query
   * @param res
   * @param req
   * @returns
   */
  async handleGetListLike(query: ListCourseDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let sessionObject = null;
      if (req) {
        sessionObject = req?.session_data;
      }

      const userId = userObject._id.toString();

      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }
      const dataToFilter = { ...query, ...{ user_id: userId, channel_id: req?.channel_id } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      const dataReturn: any = await this.courseLikeService.filterCourse(dataToFilter, orderByObject, page, limit, {
        course_id: true,
      });

      const dataReturnFinal = [];
      if (dataReturn && dataReturn.length) {
        for (const courseItem of dataReturn) {
          dataReturnFinal.push({ ...courseItem, ...{ is_like: true, is_view: false } });
        }
      }
      const countData = await this.courseLikeService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": countData })
        .status(HttpStatus.OK)
        .json(dataReturnFinal);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param res
   * @param req
   * @returns
   */
  async handleGetListView(query: ListCourseDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let sessionObject = null;
      if (req) {
        sessionObject = req?.session_data;
      }

      const userId = userObject._id.toString();

      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }
      const dataToFilter = { ...query, ...{ user_id: userId } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      const dataReturn: any = await this.courseViewService.filterCourse(dataToFilter, {}, 1, query.limit, {
        course_id: true,
      });

      const dataReturnFinal = [];
      if (dataReturn && dataReturn.length) {
        for (const courseItem of dataReturn) {
          dataReturnFinal.push({ ...courseItem, ...{ is_like: true, is_view: false } });
        }
      }
      //let dataCount = await this.courseService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturnFinal);
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
  async getCourseList(query: ListCourseDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const headerObject = req?.headers;
      let channelId: string = "";
      if (headerObject && headerObject["x-channel"]) {
        channelId = headerObject["x-channel"]?.toString();
      }

      if (channelId) {
        query = { ...query, ...{ channel_id: channelId } };
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }
      const dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      // console.log(dataToFilter, "dataToFilter");

      //Check Video View
      const dataReturn: any = await this.courseService.filter(dataToFilter, orderByObject, page, limit);

      const countCourse = await this.courseService.count(dataToFilter);
      const dataReturnFinal = [];
      const dataCourseIds = dataReturn?.map((value) => {
        return value?._id?.toString();
      });

      for (const dataIndexCourse in dataReturn) {
        dataReturn[dataIndexCourse] = dataReturn[dataIndexCourse]?.toObject();
      }

      if (query?.auth_id) {
        //Process total View
        const dataFilterView = {
          course_ids: dataCourseIds,
          user_id: query?.auth_id,
        };
        const dataView: CourseView[] = await this.courseViewService.filter(dataFilterView, {}, 1, 1000);

        const dataFilterJoin = {
          course_ids: dataCourseIds,
          user_id: query?.auth_id,
        };
        const dataJoin: CourseLike[] = await this.courseLikeService.filter(dataFilterJoin, {}, 1, 1000);

        for (const dataIndexCourse in dataReturn) {
          const dataObjectByCourse = dataView?.filter((value) => {
            if (value?.course_id?.toString() == dataReturn[dataIndexCourse]?._id?.toString()) {
              return value?.module_id?.toString();
            }
          });

          const dataObjectJoinCourse = dataJoin?.filter((value) => {
            if (value?.course_id?.toString() == dataReturn[dataIndexCourse]?._id?.toString()) {
              return value?.course_id?.toString();
            }
          });

          if (dataObjectJoinCourse?.length) {
            dataReturn[dataIndexCourse] = {
              ...dataReturn[dataIndexCourse],
              ...{ is_join: true },
            };
          } else {
            dataReturn[dataIndexCourse] = {
              ...dataReturn[dataIndexCourse],
              ...{ is_join: false },
            };
          }

          dataReturn[dataIndexCourse] = {
            ...dataReturn[dataIndexCourse],
            ...{ total_view: dataObjectByCourse?.length, module_view: dataObjectByCourse },
          };
        }
      }

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": countCourse })
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
  async getCourseModuleList(query: ListCourseModuleDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }
      const dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      //Check Video View
      const dataReturn: any = await this.courseModuleService.filter(dataToFilter, orderByObject, page, limit);
      const dataReturnFinal = [];

      const dataModuleIds = dataReturn?.map((value) => {
        return value?._id?.toString();
      });

      if (query?.auth_id) {
        //Process total View
        const dataFilterView = {
          module_ids: dataModuleIds,
          user_id: query?.auth_id,
        };
        const dataView: CourseView[] = await this.courseViewService.filter(dataFilterView, {}, 1, 1000);
        const dataModuleIdsView = dataView?.map((value) => {
          return value?.module_id?.toString();
        });

        for (const dataIndexCourse in dataReturn) {
          //Check Is View
          if (dataModuleIdsView.indexOf(dataReturn[dataIndexCourse]?._id?.toString()) != -1) {
            dataReturn[dataIndexCourse] = { ...dataReturn[dataIndexCourse]?.toObject(), ...{ is_view: true } };
          } else {
            dataReturn[dataIndexCourse] = { ...dataReturn[dataIndexCourse]?.toObject(), ...{ is_view: false } };
          }
        }
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
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleGetDetailCourse(query: ListCourseDto, id: string, res: Response, req: ExpressRequestDto) {
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
        let dataReturn: any = await this.courseService.findOne(dataToFilter);
        // console.log(dataReturn, 'dataReturn')
        if (!dataReturn) {
          throw new NotFoundException("Course not found!");
        }

        dataReturn = {
          ...dataReturn.toObject(),
          ...{ is_join: false },
        };

        if (query?.auth_id) {
          //Process total View
          const dataFilterView = {
            course_id: dataReturn?._id?.toString(),
            user_id: query?.auth_id,
          };
          const dataView: CourseView[] = await this.courseViewService.filter(dataFilterView, {}, 1, 1000);

          const dataFilterLike = {
            course_id: dataReturn?._id?.toString(),
            user_id: query?.auth_id,
          };
          const dataLike: CourseLike[] = await this.courseLikeService.filter(dataFilterView, {}, 1, 1000);

          if (dataView && dataView[0]) {
            const dataObjectByCourse = dataView?.map((value) => {
              return value?.module_id?.toString();
            });
            dataReturn = {
              ...dataReturn,
              ...{ total_view: dataObjectByCourse?.length, module_view: dataObjectByCourse },
            };
          }

          if (dataLike && dataLike[0]) {
            dataReturn = {
              ...dataReturn,
              ...{ is_join: true },
            };
          }
        }

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new NotFoundException("Course is not found!");
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
  async handleGetDetailCourseModule(id: string, res: Response, req: ExpressRequestDto) {
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
        const dataReturn = await this.courseModuleService.findOne(dataToFilter);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new NotFoundException("Course is not found!");
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
  async handleUpdateCourseByAdmin(dataUpdate: UpdateCourseDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = userObject._id.toString();
      const userPermission = await this.channelPermissionService.findOne({
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

      const dataCourse = await this.courseService.findById(dataUpdate._id.toString());
      const dataReturn = await this.courseService.update(dataUpdate);
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
  async handleDeleteCourse(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = userObject._id.toString();

      const channelObject = await this.courseService.findById(id);
      const channelId = channelObject?.channel_id?.toString();
      const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("course/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (channelObject?.user_id?.toString() == userId) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "request/delete")) {
        havePermission = true;
      }
      if (havePermission) {
        const dataReturn = await this.courseService.remove(id);
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
  async handleDeleteCourseModule(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      const requestObject = await this.courseModuleService.findByIdPopulate(id, {});
      const channelId = requestObject?.course_id?.channel_id;
      const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("course/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (requestObject?.user_id?.toString() == userId) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "request/delete")) {
        havePermission = true;
      }

      //Count Course
      if (requestObject?.parent_id) {
        await this.courseService.updateCount(
          { _id: requestObject?.course_id },
          { module_count: -1, module_child_count: -1 }
        );
      } else {
        await this.courseService.updateCount({ _id: requestObject?.course_id }, { module_count: -1 });
      }

      if (havePermission) {
        const dataReturn = await this.courseModuleService.remove(id);
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
  async processFollowUser(dataFollow: CreateCourseLikeDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const videoObject = await this.courseService.findById(dataFollow.course_id);

      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }
      //Check PlanObject
      if (Number(videoObject?.coin_value) && Number(videoObject?.coin_value) !== 1) {
        //Can't Join
        throw new NotFoundException("Can't Join manual!");
      }
      const dataReturn = this.processAddUserToCourse(userObject, dataFollow, videoObject, req);
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
  async handleAddUserToCorse(dataFollow: CreateCourseLikeDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const videoObject = await this.courseService.findById(dataFollow.course_id);

      //Check Admin
      const userId = req?.user_id;
      const userPermission = await this.channelPermissionService.findOne({
        user_id: userId,
        channel_id: req?.channel_id,
      });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("course/list") !== -1)
      ) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "course/list")) {
        havePermission = true;
      }

      if (!havePermission) {
        throw new ForbiddenException("You not have permission for this action!");
      }

      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }
      //Check PlanObject
      if (Number(videoObject?.coin_value) && Number(videoObject?.coin_value) !== 1) {
        if (dataFollow?.add_type === "payment") {
          dataFollow = { ...{ user_id: userId }, ...dataFollow };
          await this.processAddUserToCoursePayment(dataFollow, videoObject);
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataFollow);
        } else {
          const dataReturn = await this.processAddUserToCourse(userObject, dataFollow, videoObject, req);
          console.log(dataReturn, "dataReturn");
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataReturn);
        }
      } else {
        const dataReturn = await this.processAddUserToCourse(userObject, dataFollow, videoObject, req);
        console.log(dataReturn, "dataReturn");
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async processAddUserToCoursePayment(dataFollow: CreateCourseLikeDto, dataCourse: Course) {
    try {
      //Setup Category & Level
      setTimeout(async () => {
        this.hookWorker.ProcessCourseOrder(dataFollow, dataCourse);
      }, 300);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   *
   * @param userObject
   * @param dataFollow
   * @param videoObject
   * @param req
   * @returns
   */
  async processAddUserToCourse(
    userObject: User,
    dataFollow: CreateCourseLikeDto,
    videoObject: Course,
    req: ExpressRequestDto
  ) {
    try {
      const userIdToAdd = dataFollow?.user_id || userObject?._id?.toString();
      const dataUpdate = {
        user_id: userIdToAdd,
        course_id: dataFollow.course_id.toString(),
      };
      const dataReturn = await this.courseLikeService.update(dataUpdate);

      //Update count Video
      const dataUpdateFilter = {
        _id: videoObject._id.toString(),
      };

      const userObjectNew = await this.userService.findById(userIdToAdd?.toString(), {});

      //set hook send noti when user complete join course.
      this.eventHookNotificationService.sendNotiNMailJoinCourse({
        send_user_id: req?.user_id?.toString(),
        user_id: userIdToAdd,
        channel_id: req.channel_id.toString(),
        path: ``,
        mail_template: "apply_join_course",
        content: (params: any) => {
          return `Chúc mừng người dùng ${userObjectNew.display_name} tham gia khóa học thành công khóa học ${videoObject.title} kênh ${params?.channel_name}`;
        },
        title: `${userObjectNew.display_name.toLocaleUpperCase()} THAM GIA KHÓA HỌC ${videoObject.title.toLocaleUpperCase()}`,
      });

      await this.courseService.updateCount(dataUpdateFilter, { join_number: 1 });
      return dataReturn;
    } catch (error) {
      throw new BadRequestException(error.message);
      return error;
    }
  }

  /**
   *
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processViewCourse(dataFollow: CreateCourseViewDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const authCode = req?.auth_code;

      const moduleObject = await this.courseModuleService.findById(dataFollow.module_id, {});

      const dataFilterPermission = {
        channel_id: moduleObject?.course_id?.channel_id?.toString(),
        user_id: userObject?._id?.toString(),
      };
      const dataPermission = await this.channelPermissionService.findOne(dataFilterPermission);
      if (!dataPermission) {
        throw new ForbiddenException("You not have permission to this action!");
      }

      if (!moduleObject) {
        throw new NotFoundException("Video not found");
      }

      const dataUpdate = {
        user_id: userObject._id.toString(),
        course_id: moduleObject.course_id?._id?.toString(),
        module_id: dataFollow?.module_id?.toString(),
      };

      const dataReturn = await this.courseViewService.update(dataUpdate);

      //Update
      const dataChannelPoint = dataPermission?.channel_id?.point_data;
      //Check point
      let dataPoint = 1;
      if (dataChannelPoint && dataChannelPoint?.length) {
        for (const dataChannelPointItem of dataChannelPoint) {
          if (dataChannelPointItem?.key == "view_course") {
            dataPoint = parseInt(dataChannelPointItem?.value);
          }
        }
      }
      //Update user level
      //Update Count
      await this.channelPermissionService.updateCount(
        { _id: dataPermission?._id?.toString(), channel_id: dataPermission?.channel_id?._id.toString() },
        { point: dataPoint, point_month: dataPoint, point_week: dataPoint },
        authCode,
        {
          entity_id: dataFollow?.module_id?.toString(),
          entity_type: "module",
          content: moduleObject?.title,
          point_number: dataPoint,
          user_id: userObject?._id?.toString(),
        },
        "view_course"
      );

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
  async processUnFollowUser(dataFollow: CreateCourseLikeDto, req: ExpressRequestDto, res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const videoObject = await this.courseService.findById(dataFollow.course_id);

      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }

      if (dataFollow?.user_id?.toString() !== userObject?._id?.toString()) {
        //Check Admin
        const userId = req?.user_id;
        const userPermission = await this.channelPermissionService.findOne({
          user_id: userId,
          channel_id: req?.channel_id,
        });
        let havePermission = false;
        if (
          userPermission?.channel_role == "mentor" ||
          userPermission?.channel_role == "super_admin" ||
          (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("course/list") !== -1)
        ) {
          havePermission = true;
        }
        if (await this.userPermissionService.isHavePermission(userId, "course/list")) {
          havePermission = true;
        }

        if (!havePermission) {
          throw new ForbiddenException("You not have permission for this action!");
        }
      }

      const userIdArray = dataFollow.user_id?.split(",");
      const dataReturn = [];
      for (const dataUserId of userIdArray) {
        const dataUpdate = {
          user_id: dataUserId,
          course_id: dataFollow.course_id.toString(),
        };

        const dataToAdd = await this.courseLikeService.removeOne(dataUpdate);
        dataReturn.push(dataToAdd);
        //Update count Video
        const dataUpdateFilter = {
          _id: videoObject._id.toString(),
        };
        await this.courseService.updateCount(dataUpdateFilter, { join_number: -1 });
      }

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
