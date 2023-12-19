import { Response } from "express";
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
import { CreateEsimDto } from "../dto/create-esim.dto";
import { EsimService } from "../services/esim.service";
import { ListEsimDto } from "../dto/list-esim.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateEsimDto } from "../dto/update-esim.dto";
import { Types } from "mongoose";
import { EsimCountryService } from "../services/esim_country.service";
import { CreateEsimCountryDto } from "../dto/create-esim_country.dto";
import { UpdateEsimCountryDto } from "../dto/update-esim_country.dto";
import { ListEsimCountryDto } from "../dto/list-esim_country.dto";
import * as _ from "lodash";
import { PlanService } from "../../../modules/plan/services/plan.service";
import { HandleServiceService } from "../../../modules/plan/services/handle_service.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class EsimHelper {
  constructor(
    private esimService: EsimService,
    private esimCountryService: EsimCountryService,
    private planService: PlanService,
    private handleServiceService: HandleServiceService,
    private userPermissionService: UserPermissionService
  ) {}

  /**
   * @author Tony Vu
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getListEsim(query: ListEsimDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let dataToFilter = { ...query };

      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      if (query?.country_code) {
        let dataCountry = await this.esimCountryService.findOne({ country_code: query?.country_code });
        dataToFilter = { ...dataToFilter, ...{ country: dataCountry?._id?.toString() } };
      }

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      let dataReturn = await this.esimService.filter(dataToFilter, orderByOBject, page, limit);

      let dataCount = await this.esimService.count(dataToFilter);
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
  async getListEsimCountry(query: ListEsimCountryDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let dataToFilter = { ...query };

      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      let dataReturn = await this.esimCountryService.filter(dataToFilter, orderByOBject, page, limit);

      let dataCount = await this.esimCountryService.count(dataToFilter);
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
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewEsim(createEsimData: CreateEsimDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let dataPermission = await this.userPermissionService.isHavePermission(
        userObject?._id?.toString(),
        "esim/create"
      );
      if (!dataPermission) {
        throw new BadRequestException("You haven't permission for this Action!");
      }

      if (this.validateJson(createEsimData?.supported_countries)) {
        createEsimData = {
          ...createEsimData,
          ...{
            supported_countries: JSON.parse(createEsimData?.supported_countries),
          },
        };
      } else {
        createEsimData = {
          ...createEsimData,
          ...{
            supported_countries: [],
          },
        };
      }

      if (this.validateJson(createEsimData?.network)) {
        createEsimData = {
          ...createEsimData,
          ...{
            network: JSON.parse(createEsimData?.network),
          },
        };
      } else {
        createEsimData = {
          ...createEsimData,
          ...{
            network: [],
          },
        };
      }

      if (this.validateJson(createEsimData?.available_top_up)) {
        createEsimData = {
          ...createEsimData,
          ...{
            available_top_up: JSON.parse(createEsimData?.available_top_up),
          },
        };
      } else {
        createEsimData = {
          ...createEsimData,
          ...{
            available_top_up: [],
          },
        };
      }

      //Check Permission

      let dataCreate: any = await this.esimService.create(createEsimData);
      let dataService = await this.handleServiceService.findById(createEsimData?.service_id);

      //Update to Plan
      let dataToUpdate = {
        amount_of_coin: 0,
        amount_of_day: 600,
        country: createEsimData?.country,
        description: createEsimData?.description,
        google_store_product_id: "",
        service_id: createEsimData?.service_id,
        handle: dataService?.handle?.toString(),
        image: createEsimData?.avatar,
        name: createEsimData?.name,
        price: Number(createEsimData?.price),
        type: "one_time",
        version: createEsimData?.version,
        ref_id: dataCreate?._id?.toString(),
      };

      if (this.validateJson(createEsimData?.options)) {
        dataToUpdate = {
          ...dataToUpdate,
          ...{
            options: JSON.parse(createEsimData?.options),
          },
        };
      } else {
        dataToUpdate = {
          ...dataToUpdate,
          ...{
            options: [],
          },
        };
      }

      // var resultDataUpdate = _(dataToUpdate).omitBy(_.isUndefined).omitBy(_.isNull).value();
      //Update
      let dataPlan = await this.planService.create(dataToUpdate);

      //Update Esim
      await this.esimService.update({ _id: dataCreate?._id?.toString(), plan_id: dataPlan?._id?.toString() });

      let dataReturn = await this.esimService.findById(dataCreate?._id?.toString());
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
  async createNewEsimCountry(createEsimData: CreateEsimCountryDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let dataPermission = await this.userPermissionService.isHavePermission(
        userObject?._id?.toString(),
        "esim/create"
      );
      if (!dataPermission) {
        throw new BadRequestException("You haven't permission for this Action!");
      }

      if (this.validateJson(createEsimData?.translate)) {
        createEsimData = {
          ...createEsimData,
          ...{
            translate: JSON.parse(createEsimData?.translate),
          },
        };
      } else {
        createEsimData = {
          ...createEsimData,
          ...{
            translate: [],
          },
        };
      }

      let dataCreate: any = await this.esimCountryService.create(createEsimData);
      let dataReturn = await this.esimCountryService.findById(dataCreate?._id?.toString());
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
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleGetDetailEsim(id: string, query: ListEsimDto, res: Response, req: ExpressRequestDto) {
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
      dataToFilter = { ...dataToFilter, ...{ _id: objectId } };
      let dataReturn: any = await this.esimService.findOne(dataToFilter);
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
  async handleGetDetailEsimCountry(id: string, query: ListEsimDto, res: Response, req: ExpressRequestDto) {
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
      dataToFilter = { ...dataToFilter, ...{ _id: objectId } };
      let dataReturn: any = await this.esimCountryService.findOne(dataToFilter);
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
  async handleUpdateEsimByAdmin(dataUpdate: UpdateEsimDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let userId = userObject._id.toString();
      // console.log(userId);

      let dataPermission = await this.userPermissionService.isHavePermission(userId, "esim/update");
      if (!dataPermission) {
        throw new BadRequestException("You haven't permission for this Action!");
      }

      if (dataUpdate.supported_countries) {
        dataUpdate = { ...dataUpdate, ...{ supported_countries: JSON.parse(dataUpdate.supported_countries) } };
      }

      if (this.validateJson(dataUpdate?.network)) {
        dataUpdate = {
          ...dataUpdate,
          ...{
            network: JSON.parse(dataUpdate?.network),
          },
        };
      }
      if (this.validateJson(dataUpdate?.available_top_up)) {
        dataUpdate = {
          ...dataUpdate,
          ...{
            available_top_up: JSON.parse(dataUpdate?.available_top_up),
          },
        };
      }

      let dataReturn = await this.esimService.update(dataUpdate);

      //Update to Plan
      let dataToUpdate = {
        country: dataUpdate?.country,
        description: dataUpdate?.description,
        service_id: dataUpdate?.service_id,
        image: dataUpdate?.avatar,
        name: dataUpdate?.name,
        price: Number(dataUpdate?.price),
        type: "one_time",
        version: dataUpdate?.version,
      };

      var resultDataUpdate = _(dataToUpdate).omitBy(_.isUndefined).omitBy(_.isNull).value();

      if (this.validateJson(dataUpdate?.options)) {
        resultDataUpdate = {
          ...resultDataUpdate,
          ...{
            options: JSON.parse(dataUpdate?.options),
          },
        };
      } else {
        resultDataUpdate = {
          ...resultDataUpdate,
          ...{
            options: [],
          },
        };
      }
      //Update
      let dataToUpdatePlan = { ...resultDataUpdate, ...{ _id: dataReturn?.plan_id?._id.toString() } };
      await this.planService.update(dataToUpdatePlan);
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
  async handleUpdateEsimCountryByAdmin(dataUpdate: UpdateEsimCountryDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let userId = userObject._id.toString();
      // console.log(userId);

      let dataPermission = await this.userPermissionService.isHavePermission(userId, "esim/update");
      if (!dataPermission) {
        throw new BadRequestException("You haven't permission for this Action!");
      }

      if (dataUpdate.translate) {
        dataUpdate = { ...dataUpdate, ...{ translate: JSON.parse(dataUpdate.translate) } };
      }

      let dataReturn = await this.esimCountryService.update(dataUpdate);
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
  async handleDeleteEsim(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();

      if (await this.userPermissionService.isHavePermission(userId, "esim/delete")) {
        //Check Permission
        let dataReturn = await this.esimService.remove(id);
        let planId = dataReturn?.plan_id?._id?.toString();
        await this.planService.remove(planId);
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
  async handleDeleteEsimCountry(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "esim/delete")) {
        //Check Permission
        let dataReturn = await this.esimCountryService.remove(id);
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
   * @param str
   * @returns
   */
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
    str = str.replace(/-+$/g, "");
    let date = new Date().getTime();
    return str + "-" + date;
  }
}
