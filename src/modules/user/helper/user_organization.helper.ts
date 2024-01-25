import { BadRequestException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "src/dto/express-request.dto";
import {
  AddMemberToOrganizationDto,
  CreateUserOrganizationDto,
  RemoveMemberFromOrganizationDto,
} from "../dto/create-user_organization.dto";
import { ListUserOrganizationDto } from "../dto/filter-user_organization.dto";
import { UpdateUserOrganizationDto } from "../dto/update-user_organization.dto";
import { UserService } from "../services/user.service";
import { UserOrganizationService } from "../services/user_organization.service";

@Injectable()
export class UserOrganizationHelper {
  constructor(private userOrganizationService: UserOrganizationService, private userService: UserService) {}

  async get(id: string, req: ExpressRequestDto, res: Response) {
    try {
      const dataReturn = await this.userOrganizationService.findOne({ _id: id });
      if (!dataReturn) throw new Error("Not found your organization");

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": 1 })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async list(query: ListUserOrganizationDto, req: ExpressRequestDto, res: Response) {
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
      let dataReturn: any = await this.userOrganizationService.filter(dataToFilter, orderByObject, page, limit);
      let countCourse = await this.userOrganizationService.count(dataToFilter);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": countCourse })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async create(dataFollow: CreateUserOrganizationDto, req: ExpressRequestDto, res: Response) {
    try {
      const createParams: CreateUserOrganizationDto = {
        name: dataFollow.name,
        logo: dataFollow.logo,
        cover: dataFollow.cover,
        address: dataFollow.address,
        phone_number: dataFollow.phone_number,
        description: dataFollow.description,
        long_description: dataFollow.long_description,
      };
      const courseCalendarTeacher = await this.userOrganizationService.create(createParams);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(courseCalendarTeacher);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async addMember(dataFollow: AddMemberToOrganizationDto, req: ExpressRequestDto, res: Response) {
    try {
      const organization = await this.userOrganizationService.findOne({ _id: dataFollow.organization_id });
      if (!organization) throw new Error("Not found Organization");

      await this.userService.updateMultipleUsers(dataFollow.user_ids, {
        organization_id: dataFollow.organization_id,
      });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async removeMember(dataFollow: RemoveMemberFromOrganizationDto, req: ExpressRequestDto, res: Response) {
    try {
      const organization = await this.userOrganizationService.findOne({ _id: dataFollow.organization_id });
      if (!organization) throw new Error("Not found Organization");

      await this.userService.updateMultipleUsers(dataFollow.user_ids, {
        organization_id: null,
      });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(dataFollow: UpdateUserOrganizationDto, req: ExpressRequestDto, res: Response) {
    try {
      const organization = await this.userOrganizationService.findOne({
        _id: dataFollow._id,
      });
      if (!organization) throw new Error("Not found your organization");

      const updateParams: UpdateUserOrganizationDto = {
        _id: dataFollow._id.toString(),
        name: dataFollow.name,
        logo: dataFollow.logo,
        cover: dataFollow.cover,
        address: dataFollow.address,
        phone_number: dataFollow.phone_number,
        description: dataFollow.description,
        long_description: dataFollow.long_description,
      };
      const courseCalendarTeacher = await this.userOrganizationService.update(updateParams);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(courseCalendarTeacher);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: string, req: ExpressRequestDto, res: Response) {
    try {
      const dataReturn = await this.userOrganizationService.remove({ _id: id });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}

