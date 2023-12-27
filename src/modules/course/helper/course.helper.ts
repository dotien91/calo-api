import { BadRequestException, ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { Types } from "mongoose";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { EventHookWorkerService } from "../../../modules/hook/services/hook_do.service";
import { EventHookNotificationService } from "../../../modules/hook/services/hook_notification.service";
import { HandleServiceService } from "../../../modules/plan/services/handle_service.service";
import { PlanService } from "../../../modules/plan/services/plan.service";
import { User } from "../../../modules/user/schemas/user.schema";
import { UserService } from "../../../modules/user/services/user.service";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { CreateCourseDto } from "../dto/create-course.dto";
import { CreateCourseLikeDto } from "../dto/create-course_like.dto";
import { CreateCourseModuleDto } from "../dto/create-course_module.dto";
import { CreateCourseViewDto } from "../dto/create-course_view.dto";
import { ListCourseDto } from "../dto/list-course.dto";
import { ListCourseModuleDto } from "../dto/list-course_module.dto";
import { ListMemberDto } from "../dto/list-member.dto";
import { UpdateCourseDto } from "../dto/update-course.dto";
import { UpdateCourseModuleDto } from "../dto/update-course_module.dto";
import { Course } from "../schemas/course.schema";
import { CourseLike } from "../schemas/course_like.schema";
import { CourseView } from "../schemas/course_view.schema";
import { CourseService } from "../services/course.service";
import { CourseLikeService } from "../services/course_like.service";
import { CourseModuleService } from "../services/course_module.service";
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
    private userPermissionService: UserPermissionService,
    private courseLikeService: CourseLikeService,
    private courseViewService: CourseViewService,
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
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getCourseListByAdmin(query: ListCourseDto, res: Response, req: ExpressRequestDto) {
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

      let dataReturn: any = await this.courseLikeService.filterCourse(dataToFilter, orderByObject, page, limit, {
        course_id: true,
      });
      let countData = await this.courseLikeService.count(dataToFilter);

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

      let dataReturn: any = await this.courseLikeService.filterCourse(dataToFilter, orderByObject, page, limit, {
        course_id: true,
      });

      let dataReturnFinal = [];
      if (dataReturn && dataReturn.length) {
        for (let courseItem of dataReturn) {
          dataReturnFinal.push({ ...courseItem, ...{ is_like: true, is_view: false } });
        }
      }
      let countData = await this.courseLikeService.count(dataToFilter);
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
      let dataReturn: any = await this.courseService.filter(dataToFilter, orderByObject, page, limit);

      let countCourse = await this.courseService.count(dataToFilter);
      let dataCourseIds = dataReturn?.map((value) => {
        return value?._id?.toString();
      });

      for (let dataIndexCourse in dataReturn) {
        dataReturn[dataIndexCourse] = dataReturn[dataIndexCourse]?.toObject();
      }

      if (query?.auth_id) {
        //Process total View
        let dataFilterView = {
          course_ids: dataCourseIds,
          user_id: query?.auth_id,
        };
        let dataView: CourseView[] = await this.courseViewService.filter(dataFilterView, {}, 1, 1000);

        let dataFilterJoin = {
          course_ids: dataCourseIds,
          user_id: query?.auth_id,
        };
        let dataJoin: CourseLike[] = await this.courseLikeService.filter(dataFilterJoin, {}, 1, 1000);

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
          let dataLike: CourseLike[] = await this.courseLikeService.filter(dataFilterView, {}, 1, 1000);

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
  async processFollowUser(dataFollow: CreateCourseLikeDto, req: ExpressRequestDto, res: Response) {
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
  async handleAddUserToCourse(dataFollow: CreateCourseLikeDto, req: ExpressRequestDto, res: Response) {
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
      let userIdToAdd = dataFollow?.user_id || userObject?._id?.toString();
      let dataUpdate = {
        user_id: userIdToAdd,
        course_id: dataFollow.course_id.toString(),
      };
      let dataReturn = await this.courseLikeService.update(dataUpdate);

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
  async processUnFollowUser(dataFollow: CreateCourseLikeDto, req: ExpressRequestDto, res: Response) {
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

        let dataToAdd = await this.courseLikeService.removeOne(dataUpdate);
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
}
