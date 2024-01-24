import { BadRequestException, ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import * as moment from "moment";
import mongoose, { Types } from "mongoose";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { EventHookWorkerService } from "../../../modules/hook/services/hook_do.service";
import { EventHookNotificationService } from "../../../modules/hook/services/hook_notification.service";
import { HandleServiceService } from "../../../modules/plan/services/handle_service.service";
import { PlanService } from "../../../modules/plan/services/plan.service";
import { User } from "../../../modules/user/schemas/user.schema";
import { UserService } from "../../../modules/user/services/user.service";
import { CreateCourseDto } from "../dto/create-course.dto";
import { CreateCourseCalendarDto } from "../dto/create-course_calendar.dto";
import {
  AddMemberCourseClassDto,
  CreateCourseClassDto,
  RemoveMemberCourseClassDto,
} from "../dto/create-course_class.dto";
import { CreateCourseModuleDto } from "../dto/create-course_module.dto";
import { CreateCourseOneOneStudentDto, CreateCourseOneOneTeacherDto } from "../dto/create-course_one_one.dto";
import { CreateCourseReviewDto } from "../dto/create-course_review.dto";
import { CreateCourseUserDto } from "../dto/create-course_user.dto";
import { CreateCourseViewDto } from "../dto/create-course_view.dto";
import { ListCourseDto } from "../dto/list-course.dto";
import { ListCourseClassDto } from "../dto/list-course_class.dto";
import { ListCourseModuleDto } from "../dto/list-course_module.dto";
import { ListCourseOneOneDto } from "../dto/list-course_one_one.dto";
import { ListCourseReviewDto } from "../dto/list-course_review.dto";
import { ListMemberDto } from "../dto/list-member.dto";
import { UpdateCourseDto } from "../dto/update-course.dto";
import { UpdateCourseClassDto } from "../dto/update-course_class.dto";
import { UpdateCourseModuleDto } from "../dto/update-course_module.dto";
import { UpdateCourseOneOneStudentDto, UpdateCourseOneOneTeacherDto } from "../dto/update-course_one_one.dto";
import { UpdateCourseReviewDto } from "../dto/update-course_review.dto";
import {
  CourseClassType,
  CourseLevel,
  CourseOneOneRole,
  CourseSkill,
  CourseType,
} from "../interfaces/course.interface";
import { Course } from "../schemas/course.schema";
import { CourseUser } from "../schemas/course_user.schema";
import { CourseView } from "../schemas/course_view.schema";
import { CourseService } from "../services/course.service";
import { CourseCalendarService } from "../services/course_calendar.service";
import { CourseClassService } from "../services/course_class.service";
import { CourseModuleService } from "../services/course_module.service";
import { CourseOneOneService } from "../services/course_one_one.service";
import { CourseReviewService } from "../services/course_review.service";
import { CourseUserService } from "../services/course_user.service";
import { CourseViewService } from "../services/course_view.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class CourseHelper {
  constructor(
    private courseService: CourseService,
    private courseModuleService: CourseModuleService,
    private courseUserService: CourseUserService,
    private courseViewService: CourseViewService,
    private courseReviewService: CourseReviewService,
    private courseCalendarService: CourseCalendarService,
    private courseClassService: CourseClassService,
    private courseOneOneService: CourseOneOneService,
    private handleServiceService: HandleServiceService,
    private planService: PlanService,
    private readonly eventHookNotificationService: EventHookNotificationService,
    private readonly hookWorker: EventHookWorkerService,
    private readonly userService: UserService
  ) {
    setTimeout(async () => {
      //await this.handleProcessModuleCount()
    }, 1000);
  }

  async handleProcessModuleCount() {
    let dataCourse = await this.courseService.filter({}, {}, 1, 1000);
    for (let dataaCourseItem of dataCourse) {
      let countChild = await this.courseModuleService.count({
        course_id: dataaCourseItem?._id?.toString(),
        is_child: "1",
      });
      let count = await this.courseModuleService.count({ course_id: dataaCourseItem?._id?.toString() });
      let dataUpdate = {
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
      createCourseData = { ...createCourseData, ...{ user_id: req.user_object._id.toString() } };
      let dataCreate: any = await this.courseService.create(createCourseData);
      let dataReturn: any = await this.courseService.findById(dataCreate?._id?.toString());
      if (dataReturn?.price) {
        dataReturn = await this.handleUpdateServiceCourse(dataReturn);
      }

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
      let dataServiceToAdd = {
        handle: courseData?._id?.toString(),
        title: courseData?.title?.toString(),
        description: courseData?.description?.toString(),
        avatar: courseData?.avatar?._id?.toString(),
        long_description: courseData?.long_description?.toString(),
        service_type: "course",
        is_show_side_bar: false,
        router_link: "r/courses/view/" + courseData?._id,
      };
      let serviceData = await this.handleServiceService.create(dataServiceToAdd);
      if (serviceData) {
        let dataPlanCreate = {
          service_id: serviceData?._id?.toString(),
          name: courseData?.title?.toString(),
          price: Number(courseData?.price),
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
        let planService = await this.planService.create(dataPlanCreate);
        // console.log(planService, 'planService')

        if (planService) {
          let dataUpdate = {
            _id: courseData?._id?.toString(),
            service_id: serviceData?._id?.toString(),
            plan_id: planService?._id?.toString(),
          };
          let dataReturn = await this.courseService.update(dataUpdate);
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
      let dataPlanCreate = {
        _id: courseData?.plan_id?.toString(),
        service_id: courseData?.service_id.toString(),
        name: courseData?.title?.toString(),
        price: Number(courseData?.price),
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
      let planService = await this.planService.update(dataPlanCreate);
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
      let userObject = req?.user_object;
      let userId = userObject._id.toString();

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
      let dataReturn = await this.courseModuleService.findOne({ _id: dataCreate?._id?.toString() });
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
      let dataCreate: any = await this.courseService.update(dataUpdate);
      if (dataCreate?.price && !dataCreate?.service_id) {
        dataCreate = await this.handleUpdateServiceCourse(dataCreate);
      }
      if (dataCreate?.price && dataCreate?.service_id) {
        await this.handleUpdatePlan(dataCreate);
      }
      if (!Number(dataCreate?.price) && dataCreate?.service_id) {
        //Update service
        let dataUpdate = {
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
      let dataCreate: any = await this.courseModuleService.update(dataUpdate);
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
   * @param body
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getCourseListByAdmin(body: ListCourseDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(body.limit) > 1000) {
        body.limit = 1000;
      }

      let limit = body.limit ? body.limit : 1000;
      let page = body.page ? body.page : 1;
      let orderByObject = {};
      if (body.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: body.order_by } };
      }
      let dataToFilter = { ...body };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      let dataReturn = await this.courseService.filter(dataToFilter, orderByObject, page, limit);
      let dataCount = await this.courseService.count(dataToFilter);
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
   * @param res
   * @param req
   * @returns
   */
  async handleGetListMember(query: ListMemberDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      if (query?.search) {
        //Search User First
        let dataSearch = {
          search: query?.search,
        };
        let dataUserArray = await this.userService.filter(dataSearch, orderByObject, page, limit * 10);
        let ids = dataUserArray.map((itemValue, index) => {
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

      let dataReturn: any = await this.courseUserService.filterCourse(dataToFilter, orderByObject, page, limit, {
        course_id: true,
      });
      let countData = await this.courseUserService.count(dataToFilter);

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
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query, ...{ user_id: userId } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      let dataReturn: any = await this.courseUserService.filterCourse(dataToFilter, orderByObject, page, limit, {
        course_id: true,
      });

      let dataReturnFinal = [];
      if (dataReturn && dataReturn.length) {
        for (let courseItem of dataReturn) {
          dataReturnFinal.push({ ...courseItem, ...{ is_like: true, is_view: false } });
        }
      }
      let countData = await this.courseUserService.count(dataToFilter);
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
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let userId = userObject._id.toString();

      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query, ...{ user_id: userId } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      let dataReturn: any = await this.courseViewService.filterCourse(dataToFilter, {}, 1, query.limit, {
        course_id: true,
      });

      let dataReturnFinal = [];
      if (dataReturn && dataReturn.length) {
        for (let courseItem of dataReturn) {
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
   * @param body
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getCourseList(body: ListCourseDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(body.limit) > 1000) {
        body.limit = 1000;
      }

      let limit = body.limit ? body.limit : 1000;
      let page = body.page ? body.page : 1;
      let orderByObject = {};
      if (body.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: body.order_by } };
      }
      let dataToFilter = { ...body };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      //Check Video View
      let dataReturn: any = await this.courseService.filter(dataToFilter, orderByObject, page, limit);

      let countCourse = await this.courseService.count(dataToFilter);
      let dataCourseIds = dataReturn?.map((value) => {
        return value?._id?.toString();
      });

      for (let dataIndexCourse in dataReturn) {
        dataReturn[dataIndexCourse] = dataReturn[dataIndexCourse]?.toObject();
      }

      if (body?.auth_id) {
        //Process total View
        let dataFilterView = {
          course_ids: dataCourseIds,
          user_id: body?.auth_id,
        };
        let dataView: CourseView[] = await this.courseViewService.filter(dataFilterView, {}, 1, 1000);

        let dataFilterJoin = {
          course_ids: dataCourseIds,
          user_id: body?.auth_id,
        };
        let dataJoin: CourseUser[] = await this.courseUserService.filter(dataFilterJoin, {}, 1, 1000);

        for (let dataIndexCourse in dataReturn) {
          let dataObjectByCourse = dataView?.filter((value) => {
            if (value?.course_id?.toString() == dataReturn[dataIndexCourse]?._id?.toString()) {
              return value?.module_id?.toString();
            }
          });

          let dataObjectJoinCourse = dataJoin?.filter((value) => {
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

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      //Check Video View
      let dataReturn: any = await this.courseModuleService.filter(dataToFilter, orderByObject, page, limit);
      let dataReturnFinal = [];

      let dataModuleIds = dataReturn?.map((value) => {
        return value?._id?.toString();
      });

      if (query?.auth_id) {
        //Process total View
        let dataFilterView = {
          module_ids: dataModuleIds,
          user_id: query?.auth_id,
        };
        let dataView: CourseView[] = await this.courseViewService.filter(dataFilterView, {}, 1, 1000);
        let dataModuleIdsView = dataView?.map((value) => {
          return value?.module_id?.toString();
        });

        for (let dataIndexCourse in dataReturn) {
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
          let dataFilterView = {
            course_id: dataReturn?._id?.toString(),
            user_id: query?.auth_id,
          };
          let dataView: CourseView[] = await this.courseViewService.filter(dataFilterView, {}, 1, 1000);

          let dataFilterLike = {
            course_id: dataReturn?._id?.toString(),
            user_id: query?.auth_id,
          };
          let dataLike: CourseUser[] = await this.courseUserService.filter(dataFilterView, {}, 1, 1000);

          if (dataView && dataView[0]) {
            let dataObjectByCourse = dataView?.map((value) => {
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
      if (error.status === 404) throw new NotFoundException(error.message);
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
        let dataReturn = await this.courseModuleService.findOne(dataToFilter);
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
  async handleDeleteCourse(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let dataReturn = await this.courseService.remove(id);

      if (!dataReturn) throw new NotFoundException("Not found course");

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
  async handleDeleteCourseModule(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let requestObject = await this.courseModuleService.findByIdPopulate(id, {});

      //Count Course
      if (requestObject?.parent_id) {
        await this.courseService.updateCount(
          { _id: requestObject?.course_id },
          { module_count: -1, module_child_count: -1 }
        );
      } else {
        await this.courseService.updateCount({ _id: requestObject?.course_id }, { module_count: -1 });
      }

      let dataReturn = await this.courseModuleService.remove(id);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
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
      official_status: userObject.official_status,
    };
  }

  /**
   * @author Tony Vu
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processFollowUser(dataFollow: CreateCourseUserDto, req: ExpressRequestDto, res: Response) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let videoObject = await this.courseService.findById(dataFollow.course_id);

      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }
      //Check PlanObject
      if (Number(videoObject?.price) && Number(videoObject?.price) !== 1) {
        //Can't Join
        throw new NotFoundException("Can't Join manual!");
      }
      let dataReturn = this.processAddUserToCourse(userObject, dataFollow, videoObject, req);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      if (error.status === 404) throw new NotFoundException(error.message);
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
  async handleAddUserToCourse(dataFollow: CreateCourseUserDto, req: ExpressRequestDto, res: Response) {
    try {
      let userObject = req?.user_object;
      let userId = userObject._id;

      let videoObject = await this.courseService.findById(dataFollow.course_id);
      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }
      //Check PlanObject
      if (Number(videoObject?.price) && Number(videoObject?.price) !== 1) {
        if (dataFollow?.add_type === "payment") {
          dataFollow = { ...{ user_id: userId }, ...dataFollow };
          await this.processAddUserToCoursePayment(dataFollow, videoObject);
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataFollow);
        } else {
          let dataReturn = await this.processAddUserToCourse(userObject, dataFollow, videoObject, req);
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataReturn);
        }
      } else {
        let dataReturn = await this.processAddUserToCourse(userObject, dataFollow, videoObject, req);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async processAddUserToCoursePayment(dataFollow: CreateCourseUserDto, dataCourse: Course) {
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
    dataFollow: CreateCourseUserDto,
    videoObject: Course,
    req: ExpressRequestDto
  ) {
    try {
      let userIdToAdd = dataFollow?.user_id || userObject?._id?.toString();
      let dataUpdate = {
        user_id: userIdToAdd,
        course_id: dataFollow.course_id.toString(),
      };
      let dataReturn = await this.courseUserService.update(dataUpdate);

      //Update count Video
      let dataUpdateFilter = {
        _id: videoObject._id.toString(),
      };

      let userObjectNew = await this.userService.findById(userIdToAdd?.toString(), {});

      //set hook send noti when user complete join course.
      this.eventHookNotificationService.sendNotiNMailJoinCourse({
        send_user_id: req?.user_id?.toString(),
        user_id: userIdToAdd,
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
      let userObject = req?.user_object;

      let moduleObject = await this.courseModuleService.findById(dataFollow.module_id, {});
      if (!moduleObject) {
        throw new NotFoundException("Video not found");
      }

      let dataUpdate = {
        user_id: userObject._id.toString(),
        course_id: moduleObject.course_id?._id?.toString(),
        module_id: dataFollow?.module_id?.toString(),
      };

      let dataReturn = await this.courseViewService.update(dataUpdate);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      if (error.status === 404) throw new NotFoundException("Video not found");
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
  async processUnFollowUser(dataFollow: CreateCourseUserDto, req: ExpressRequestDto, res: Response) {
    try {
      let videoObject = await this.courseService.findById(dataFollow.course_id);
      if (!videoObject) {
        throw new NotFoundException("Video not found");
      }

      let userIdArray = dataFollow.user_id?.split(",");
      let dataReturn = [];
      for (let dataUserId of userIdArray) {
        let dataUpdate = {
          user_id: dataUserId,
          course_id: dataFollow.course_id.toString(),
        };

        let dataToAdd = await this.courseUserService.removeOne(dataUpdate);
        dataReturn.push(dataToAdd);
        //Update count Video
        let dataUpdateFilter = {
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

  // helper for course review
  async getCourseReviewList(query: ListCourseReviewDto, req: ExpressRequestDto, res: Response) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      //Check Video View
      let dataReturn: any = await this.courseReviewService.filter(dataToFilter, orderByObject, page, limit);
      let countCourse = await this.courseReviewService.count(dataToFilter);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": countCourse })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async createNewReview(dataFollow: CreateCourseReviewDto, req: ExpressRequestDto, res: Response) {
    try {
      // check if user is in course
      const user = await this.courseUserService.findOne({
        user_id: dataFollow.user_id,
        course_id: dataFollow.course_id,
      });
      if (!user) throw new Error("User don't have permission to leave review in this course");

      const isReviewed = await this.courseReviewService.findOne({
        user_id: dataFollow.user_id,
        course_id: dataFollow.course_id,
      });
      if (isReviewed) throw new Error("You're already leave review for this course");

      const courseReview = await this.courseReviewService.create(dataFollow);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(courseReview);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateReview(dataFollow: UpdateCourseReviewDto, req: ExpressRequestDto, res: Response) {
    try {
      const courseReview = await this.courseReviewService.update(dataFollow);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(courseReview);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteReview(id: string, req: ExpressRequestDto, res: Response) {
    try {
      const user = req?.user_object;
      const courseReview = await this.courseReviewService.findOne({
        _id: id,
        user_id: user?._id,
      });
      if (!courseReview) throw new Error("You don't have permission to do this action");

      await this.courseReviewService.remove({ _id: id });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(courseReview);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getFilterItems(req: ExpressRequestDto, res: Response) {
    try {
      const dataReturn = {
        levels: [
          CourseLevel.FOUR_PLUS,
          CourseLevel.FIVE_PLUS,
          CourseLevel.SIX_PLUS,
          CourseLevel.SEVEN_PLUS,
          CourseLevel.EIGHT_PLUS,
          CourseLevel.NINE,
        ],
        skills: [
          CourseSkill.ALL_SKILLS,
          CourseSkill.LISTENING,
          CourseSkill.READING,
          CourseSkill.WRITING,
          CourseSkill.SPEAKING,
        ],
        types: [CourseType.ALL_FORMS, CourseType.CALL_ONE_ONE, CourseType.SELF_LEARNING, CourseType.CALL_GROUP],
        price: "slider",
        onlyEnglishNativeSpeakers: "checkbox",
      };

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // helper for course class
  async getCourseClassList(query: ListCourseClassDto, req: ExpressRequestDto, res: Response) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      //Check Video View
      let dataReturn: any = await this.courseClassService.filter(dataToFilter, orderByObject, page, limit);
      let countCourse = await this.courseClassService.count(dataToFilter);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": countCourse })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async createNewClass(dataFollow: CreateCourseClassDto, req: ExpressRequestDto, res: Response) {
    try {
      // check if user is in course
      const userObject = req.user_object;
      if (!userObject) throw new Error("User is invalid");

      const course = await this.courseService.findOne({
        user_id: userObject._id.toString(),
        _id: dataFollow.course_id,
      });
      if (!course) throw new Error("User don't have permission to create new class in this course");

      // check other class time
      const courseClasses = await this.courseClassService.getAllAssignedTimeInCourse(dataFollow.course_id);
      for (const courseClass of courseClasses) {
        const signedTimes = courseClass.course_calendar_ids.map((courseCalendar) => ({
          day: courseCalendar.day,
          time_start: courseCalendar.time_start,
          time_end: courseCalendar.time_end,
        }));

        const incomingTimes = dataFollow.course_calendars.map((courseCalendar) => ({
          day: courseCalendar.day,
          time_start: courseCalendar.time_start,
          time_end: this.addDurationToTime(courseCalendar.time_start, courseCalendar.time_duration),
        }));

        if (this.hasTimeAndDayConflict(incomingTimes, signedTimes))
          throw new Error("There is already class that assigned the same time");
      }

      // create course calendar
      const calendarIds = [];
      for (const calendar of dataFollow.course_calendars) {
        const endTime = this.addDurationToTime(calendar.time_start, calendar.time_duration);
        const params: CreateCourseCalendarDto = {
          day: calendar.day,
          time_start: calendar.time_start,
          time_end: endTime,
          time_duration: calendar.time_duration,
          course_type: CourseClassType.CLASS,
        };
        const newCalendar = await this.courseCalendarService.create(params);
        calendarIds.push(newCalendar._id);
      }

      // create new class
      const createParams = {
        course_id: dataFollow.course_id,
        course_calendar_ids: calendarIds,
        name: dataFollow.name,
        start_time: dataFollow.start_time,
        end_time: dataFollow.end_time,
        limit_member: dataFollow.limit_member,
      };
      const courseClass = await this.courseClassService.create(createParams);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(courseClass);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateClass(dataFollow: UpdateCourseClassDto, req: ExpressRequestDto, res: Response) {
    try {
      const oldClass = await this.courseClassService.findOne({
        _id: dataFollow._id,
      });
      if (!oldClass) throw new Error("Not found your class");

      // check other class time
      const courseClasses = await this.courseClassService.getAllAssignedTimeInCourse(
        oldClass.course_id.toString(),
        oldClass.course_calendar_ids
      );
      for (const courseClass of courseClasses) {
        const signedTimes = courseClass.course_calendar_ids.map((courseCalendar) => ({
          day: courseCalendar.day,
          time_start: courseCalendar.time_start,
          time_end: courseCalendar.time_end,
        }));

        const incomingTimes = dataFollow.course_calendars.map((courseCalendar) => ({
          day: courseCalendar.day,
          time_start: courseCalendar.time_start,
          time_end: this.addDurationToTime(courseCalendar.time_start, courseCalendar.time_duration),
        }));

        if (this.hasTimeAndDayConflict(incomingTimes, signedTimes))
          throw new Error("There is already class that assigned the same time");
      }

      // should drop old class calendar
      if (dataFollow.course_calendars.length) {
        this.courseCalendarService.remove({
          _id: {
            $in: oldClass.course_calendar_ids,
          },
        });
      }

      // create course calendar
      const calendarIds = [];
      for (const calendar of dataFollow.course_calendars) {
        const endTime = this.addDurationToTime(calendar.time_start, calendar.time_duration);
        const params: CreateCourseCalendarDto = {
          day: calendar.day,
          time_start: calendar.time_start,
          time_end: endTime,
          time_duration: calendar.time_duration,
          course_type: CourseClassType.CLASS,
        };
        const newCalendar = await this.courseCalendarService.create(params);
        calendarIds.push(newCalendar._id);
      }

      const updateParams = {
        _id: dataFollow._id,
        course_calendar_ids: calendarIds,
        name: dataFollow.name,
        start_time: dataFollow.start_time,
        end_time: dataFollow.end_time,
        limit_member: dataFollow.limit_member,
      };
      const courseClass = await this.courseClassService.update(updateParams);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(courseClass);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteClass(id: string, req: ExpressRequestDto, res: Response) {
    try {
      const courseClass = await this.courseClassService.remove({ _id: id });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(courseClass);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async addMemberToClass(dataFollow: AddMemberCourseClassDto, req: ExpressRequestDto, res: Response) {
    try {
      const courseClass = await this.courseClassService.findOne({
        _id: dataFollow.class_id,
      });
      if (!courseClass) throw new Error("Not found your class");

      const isUserBoughtCourse = await this.courseUserService.findOne({
        user_id: dataFollow.user_id,
        course_id: courseClass.course_id,
      });
      if (!isUserBoughtCourse) throw new Error("Cannot add to the class due to this user has not buy the course yet");

      if (courseClass.limit_member === courseClass.members.length)
        throw new Error("The class has been full of members");

      await this.courseClassService.update({
        _id: courseClass._id,
        members: [...courseClass.members, new mongoose.Types.ObjectId(dataFollow.user_id)],
      });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .send();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async removeMemberFromClass(dataFollow: RemoveMemberCourseClassDto, req: ExpressRequestDto, res: Response) {
    try {
      const courseClass = await this.courseClassService.findOne({
        _id: dataFollow.class_id,
      });
      if (!courseClass) throw new Error("Not found your class");

      const newMembers = courseClass.members.filter((member) => {
        return member.toString() !== dataFollow.user_id;
      });

      await this.courseClassService.update({
        _id: courseClass._id,
        members: newMembers,
      });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .send();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  addDurationToTime(time: string, duration: number) {
    // Parse the input time using Moment.js
    const parsedTime = moment(time, "HH:mm");

    // Add the duration in hours
    const resultTime = parsedTime.add(duration, "hours");

    // Format the result in the desired format
    const formattedResult = resultTime.format("HH:mm");

    return formattedResult;
  }

  hasTimeAndDayConflict(array1, array2) {
    for (const item1 of array1) {
      for (const item2 of array2) {
        if (item1.day === item2.day) {
          const start1 = new Date(`2022-01-01 ${item1.time_start}`);
          const end1 = new Date(`2022-01-01 ${item1.time_end}`);
          const start2 = new Date(`2022-01-01 ${item2.time_start}`);
          const end2 = new Date(`2022-01-01 ${item2.time_end}`);

          // Check for no time overlap
          if (end1 <= start2 || end2 <= start1) {
            continue; // No conflict, continue checking other pairs
          } else {
            return true; // Conflict found
          }
        }
      }
    }

    return false; // No conflicts
  }

  areAllInRanges(array1, array2) {
    for (const item1 of array1) {
      let isInRange = false;

      for (const item2 of array2) {
        if (item1.day === item2.day) {
          const start1 = new Date(`2022-01-01 ${item1.time_start}`);
          const end1 = new Date(`2022-01-01 ${item1.time_end}`);
          const start2 = new Date(`2022-01-01 ${item2.time_start}`);
          const end2 = new Date(`2022-01-01 ${item2.time_end}`);

          // Check if item1 is within the range of item2
          if (start1 >= start2 && end1 <= end2) {
            isInRange = true;
            break;
          }
        }
      }

      // If any item from array1 is not in range, return false
      if (!isInRange) {
        return false;
      }
    }

    return true; // All items from array1 are in range
  }

  // helper for course calendar teacher
  async getCourseCalendarTeacherList(query: ListCourseOneOneDto, req: ExpressRequestDto, res: Response) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query, role: CourseOneOneRole.TEACHER };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      //Check Video View
      let dataReturn: any = await this.courseOneOneService.filter(dataToFilter, orderByObject, page, limit);
      let countCourse = await this.courseOneOneService.count(dataToFilter);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": countCourse })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async createCourseCalendarTeacher(dataFollow: CreateCourseOneOneTeacherDto, req: ExpressRequestDto, res: Response) {
    try {
      const calendarIds = [];
      for (const calendar of dataFollow.time_available) {
        const params: any = {
          day: calendar.day,
          time_start: calendar.time_start,
          time_end: calendar.time_end,
          course_type: CourseClassType.ONE_ONE,
        };
        const newCalendar = await this.courseCalendarService.create(params);
        calendarIds.push(newCalendar._id);
      }

      // create new class
      const createParams = {
        course_id: dataFollow.course_id,
        user_id: dataFollow.user_id,
        time_available: calendarIds,
        role: CourseOneOneRole.TEACHER,
      };
      const courseCalendarTeacher = await this.courseOneOneService.create(createParams);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(courseCalendarTeacher);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateCourseCalendarTeacher(dataFollow: UpdateCourseOneOneTeacherDto, req: ExpressRequestDto, res: Response) {
    try {
      const oldClass = await this.courseOneOneService.findOne({
        user_id: dataFollow.user_id,
        course_id: dataFollow.course_id,
        role: CourseOneOneRole.TEACHER,
      });
      if (!oldClass) throw new Error("Not found your course");

      // should drop old class calendar
      if (dataFollow.time_available.length) {
        this.courseCalendarService.remove({
          _id: {
            $in: oldClass.time_available,
          },
        });
      }

      // create course calendar
      const calendarIds = [];
      for (const calendar of dataFollow.time_available) {
        const params: any = {
          day: calendar.day,
          time_start: calendar.time_start,
          time_end: calendar.time_end,
          course_type: CourseClassType.ONE_ONE,
        };
        const newCalendar = await this.courseCalendarService.create(params);
        calendarIds.push(newCalendar._id);
      }

      const updateParams = {
        _id: oldClass._id.toString(),
        time_available: calendarIds,
        role: CourseOneOneRole.TEACHER,
      };
      const courseCalendarTeacher = await this.courseOneOneService.update(updateParams);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(courseCalendarTeacher);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // helper for course calendar student
  async getCourseCalendarStudentList(query: ListCourseOneOneDto, req: ExpressRequestDto, res: Response) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByObject = {};
      if (query.order_by) {
        orderByObject = { ...orderByObject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query, role: CourseOneOneRole.STUDENT };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      //Check Video View
      let dataReturn: any = await this.courseOneOneService.filter(dataToFilter, orderByObject, page, limit);
      let countCourse = await this.courseOneOneService.count(dataToFilter);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": countCourse })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async createCourseCalendarStudent(dataFollow: CreateCourseOneOneStudentDto, req: ExpressRequestDto, res: Response) {
    try {
      // check if the student time pick is conflict with other student or not
      const courseClasses_Student = await this.courseOneOneService.getAllAssignedTimeInCourseOfStudent(
        dataFollow.course_id
      );
      for (const courseClass of courseClasses_Student) {
        const signedTimes = courseClass.time_pick.map((courseCalendar) => ({
          day: courseCalendar.day,
          time_start: courseCalendar.time_start,
          time_end: courseCalendar.time_end,
        }));

        const incomingTimes = dataFollow.time_pick.map((courseCalendar) => ({
          day: courseCalendar.day,
          time_start: courseCalendar.time_start,
          time_end: courseCalendar.time_end,
        }));

        if (this.hasTimeAndDayConflict(incomingTimes, signedTimes))
          throw new Error("There is already student that assigned the same time");
      }

      // check if the student time pick is conflict with other student or not
      const courseClasses_Teacher = await this.courseOneOneService.getAllAssignedTimeInCourseOfTeacher(
        dataFollow.course_id
      );
      for (const courseClass of courseClasses_Teacher) {
        const signedTimes = courseClass.time_available.map((courseCalendar) => ({
          day: courseCalendar.day,
          time_start: courseCalendar.time_start,
          time_end: courseCalendar.time_end,
        }));

        const incomingTimes = dataFollow.time_pick.map((courseCalendar) => ({
          day: courseCalendar.day,
          time_start: courseCalendar.time_start,
          time_end: courseCalendar.time_end,
        }));

        if (!this.areAllInRanges(incomingTimes, signedTimes))
          throw new Error("The teacher has no activity in that signed time");
      }

      const calendarIds = [];
      for (const calendar of dataFollow.time_pick) {
        const params: any = {
          day: calendar.day,
          time_start: calendar.time_start,
          time_end: calendar.time_end,
          course_type: CourseClassType.ONE_ONE,
        };
        const newCalendar = await this.courseCalendarService.create(params);
        calendarIds.push(newCalendar._id);
      }

      // create new class
      const createParams = {
        course_id: dataFollow.course_id,
        user_id: dataFollow.user_id,
        time_pick: calendarIds,
        role: CourseOneOneRole.STUDENT,
      };
      const courseCalendarTeacher = await this.courseOneOneService.create(createParams);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(courseCalendarTeacher);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateCourseCalendarStudent(dataFollow: UpdateCourseOneOneStudentDto, req: ExpressRequestDto, res: Response) {
    try {
      const oldClass = await this.courseOneOneService.findOne({
        user_id: dataFollow.user_id,
        course_id: dataFollow.course_id,
        role: CourseOneOneRole.STUDENT,
      });
      if (!oldClass) throw new Error("Not found your class");

      // // check if the student time pick is conflict with other student or not
      const courseClasses_Student = await this.courseOneOneService.getAllAssignedTimeInCourseOfStudent(
        dataFollow.course_id,
        oldClass.time_pick
      );
      for (const courseClass of courseClasses_Student) {
        const signedTimes = courseClass.time_pick.map((courseCalendar) => ({
          day: courseCalendar.day,
          time_start: courseCalendar.time_start,
          time_end: courseCalendar.time_end,
        }));

        const incomingTimes = dataFollow.time_pick.map((courseCalendar) => ({
          day: courseCalendar.day,
          time_start: courseCalendar.time_start,
          time_end: courseCalendar.time_end,
        }));

        if (this.hasTimeAndDayConflict(incomingTimes, signedTimes))
          throw new Error("There is already student that assigned the same time");
      }

      // check if the student time pick is conflict with other student or not
      const courseClasses_Teacher = await this.courseOneOneService.getAllAssignedTimeInCourseOfTeacher(
        dataFollow.course_id
      );
      for (const courseClass of courseClasses_Teacher) {
        const signedTimes = courseClass.time_available.map((courseCalendar) => ({
          day: courseCalendar.day,
          time_start: courseCalendar.time_start,
          time_end: courseCalendar.time_end,
        }));

        const incomingTimes = dataFollow.time_pick.map((courseCalendar) => ({
          day: courseCalendar.day,
          time_start: courseCalendar.time_start,
          time_end: courseCalendar.time_end,
        }));

        if (!this.areAllInRanges(incomingTimes, signedTimes))
          throw new Error("The teacher has no activity in that signed time");
      }

      // should drop old class calendar
      if (dataFollow.time_pick.length) {
        this.courseCalendarService.remove({
          _id: {
            $in: oldClass.time_pick,
          },
        });
      }

      const calendarIds = [];
      for (const calendar of dataFollow.time_pick) {
        const params: any = {
          day: calendar.day,
          time_start: calendar.time_start,
          time_end: calendar.time_end,
          course_type: CourseClassType.ONE_ONE,
        };
        const newCalendar = await this.courseCalendarService.create(params);
        calendarIds.push(newCalendar._id);
      }

      const updateParams = {
        _id: oldClass._id.toString(),
        time_pick: calendarIds,
        role: CourseOneOneRole.STUDENT,
      };
      const courseCalendarTeacher = await this.courseOneOneService.update(updateParams);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(courseCalendarTeacher);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
