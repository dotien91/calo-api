import { BadRequestException, ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import axios from "axios";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UserService } from "../../user/services/user.service";
import { CreateContactUsDto } from "../dto/create-contact_us.dto";
import { CreateReportDto } from "../dto/create-report.dto";
import { ListReportDto } from "../dto/list-report.dto";
import { UpdateReportDto } from "../dto/update-report.dto";
import { ReportService } from "../services/report.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class ReportHelper {
  constructor(
    private appUserService: UserService,
    private reportService: ReportService,
    private userService: UserService,
    private userPermissionService: UserPermissionService
  ) { }

  /**
   * @author Tony Vu
   * @param createPlanData
   * @param res
   * @param req
   * @returns
   */
  async createReport(createReportData: CreateReportDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      const partnerObject = await this.userService.findById(createReportData?.partner_id.toString(), {});
      if (!partnerObject) {
        throw new NotFoundException("Partner is not exist!");
      }
      if (createReportData.report_type === "block") {
        const dataToFilter = {
          user_id: userObject._id.toString(),
          partner_id: createReportData.partner_id,
          report_type: "block",
        };
        const dataOld = await this.reportService.findOne(dataToFilter);
      }

      createReportData = { ...createReportData, ...{ user_id: userId } };
      const dataReturn = await this.reportService.create(createReportData);
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
   * @param createReportData
   * @param res
   * @param req
   * @returns
   */
  async createNewReportAnonymous(createReportData: CreateReportDto, res: Response, req: ExpressRequestDto) {
    try {
      createReportData = { ...createReportData };
      const dataReturn = await this.reportService.create(createReportData);
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
   * @param createPlanData
   * @param res
   * @param req
   * @returns
   */
  async createContactUs(createReportData: CreateContactUsDto, res: Response, req: ExpressRequestDto) {
    try {
      const partnerObject = await this.userService.findById(createReportData?.partner_id.toString(), {});
      if (!partnerObject) {
        throw new NotFoundException("Partner is not exist!");
      }
      if (process.env.BRANCH_NAME !== "funy_sound") {
        const googleRecaptchaKey = process.env.GOOGLE_RECAPTCHA_KEY;
        //Check Recaptcha
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${googleRecaptchaKey}&response=${createReportData.g_recaptcha_response}`;
        const dataAxios = await axios
          .post(url, {})
          .then((response: any) => {
            if (response?.data?.success == true) {
              return true;
            } else {
              return false;
            }
          })
          .catch((error) => {
            return false;
          });
        if (!dataAxios) {
          throw new NotFoundException("Recaptcha not validate!");
        }
      }

      delete createReportData.g_recaptcha_response;
      createReportData = { ...createReportData, ...{ user_id: createReportData?.partner_id } };
      const dataReturn = await this.reportService.create(createReportData);
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
   * @param updateReportData
   * @param res
   * @param req
   * @returns
   */
  async updateReport(updateReportData: UpdateReportDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      const partnerObject = await this.userService.findById(updateReportData?.partner_id.toString(), {});
      if (!partnerObject) {
        throw new NotFoundException("Partner is not exist!");
      }
      //Check Permission
      const reportData = await this.reportService.findOne({ _id: updateReportData._id.toString() });
      if (reportData && reportData.user_id.toString()) {
        if (
          reportData.user_id.toString() !== userId &&
          !(await this.userPermissionService.isHavePermission(userId, "report/update"))
        ) {
          throw new BadRequestException("You haven't permission for this Action!");
        }
        // updateReportData = { ...updateReportData, ...{ user_id: userId } };
        const dataReturn = await this.reportService.update(updateReportData);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new NotFoundException("Report is not exist!");
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
  async getAllReportByAdmin(query: ListReportDto, res: Response, req: ExpressRequestDto) {
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
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "report/list")) {
        //Check Permission
        const dataToFilter = query;
        delete dataToFilter.page;
        delete dataToFilter.limit;
        delete dataToFilter.order_by;
        const dataReturn = await this.reportService.filter(dataToFilter, orderByOBject, page, limit);
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
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getReportByUserId(query: ListReportDto, id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (id !== userObject._id.toString()) {
        if (!(await this.userPermissionService.isHavePermission(userId, "subscribe/list"))) {
          throw new BadRequestException("You haven't permission for this Action!");
        }
      }
      //Check Permission
      let dataToFilter = {
        user_id: id,
      };
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      const dataToFilterBefore = query;
      delete dataToFilterBefore.page;
      delete dataToFilterBefore.limit;
      delete dataToFilterBefore.order_by;
      dataToFilter = { ...dataToFilterBefore, ...dataToFilter };
      const dataReturn = await this.reportService.filter(dataToFilter, orderByOBject, page, limit);
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
  async removeReport(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "report/delete")) {
        //Check Permission
        const dataReturn = await this.reportService.remove(id);
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
  async handleGetDetailReport(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "report/list")) {
        const dataFilter = {
          _id: id,
        };
        //Check Permission
        const dataReturn = await this.reportService.findOne(dataFilter);
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
