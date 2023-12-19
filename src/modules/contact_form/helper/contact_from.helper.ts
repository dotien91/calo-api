import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { UserOptionService } from "../../../modules/user/services/user_option.service";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UserService } from "../../user/services/user.service";
import { CreateContactFormDto } from "../dto/create-contact_form.dto";
import { ListContactFormDto } from "../dto/list-contact_form.dto";
import { UpdateContactFormDto } from "../dto/update-contact_form.dto";
import { updateStatusContactForm } from "../dto/update-status-contact_form.dto";
import { ContactFormService } from "../services/contact_form.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class ContactFormHelper {
  constructor(
    private appUserService: UserService,
    private contactFormService: ContactFormService,
    private userService: UserService,
    private userOptionService: UserOptionService,
    private userPermissionService: UserPermissionService,
  ) {}

  /**
   * @author Tony Vu
   * @param createPlanData
   * @param res
   * @param req
   * @returns
   */
  async createContactForm(createContactFormData: CreateContactFormDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      //Update contact Form User
      let dataUpdate = {
        _id: createContactFormData?.entity_id,
      };
      const userId = userObject._id.toString();
      if (!createContactFormData?.user_id) {
        createContactFormData = { ...createContactFormData, ...{ user_id: userId } };
        createContactFormData = { ...createContactFormData, ...{ note: "user_edit" } };
        dataUpdate = { ...dataUpdate, ...{ user_entity: userId } };
      } else {
        createContactFormData = { ...createContactFormData, ...{ note: "admin_edit" } };
        dataUpdate = { ...dataUpdate, ...{ user_entity: createContactFormData.user_id } };
      }

      // //Check Entity
      // if (createContactFormData?.form_status) {
      //   const dataEntity = await this.postService.findById(createContactFormData?.entity_id?.toString());
      //   //Check
      //   if (
      //     dataEntity?.user_id?._id?.toString() === userId ||
      //     (await this.userPermissionService.isHavePermission(userId, "contact_form/update"))
      //   ) {
      //     //
      //   } else {
      //     //Not have Permission
      //     throw new BadRequestException("You haven't permission for this Action!");
      //   }
      // }

      const dataReturn = await this.contactFormService.create(createContactFormData);
      // await this.postService.updateUserEntity(dataUpdate);

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
   * @param updateContactFormData
   * @param res
   * @param req
   * @returns
   */
  async updateContactForm(updateContactFormData: UpdateContactFormDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      //Check Permission
      const contactFormData = await this.contactFormService.findOne({ _id: updateContactFormData._id.toString() });
      if (contactFormData && contactFormData.user_id.toString()) {
        if (
          contactFormData.user_id.toString() !== userId &&
          !(await this.userPermissionService.isHavePermission(userId, "contact_form/update"))
        ) {
          throw new BadRequestException("You haven't permission for this Action!");
        }
        updateContactFormData = { ...updateContactFormData, ...{ user_id: userId } };
        const dataReturn = await this.contactFormService.update(updateContactFormData);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new NotFoundException("ContactForm is not exist!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param updateStatusContactForm
   * @param res
   * @param req
   */
  async updateStatusContactForm(
    updateStatusContactForm: updateStatusContactForm,
    res: Response,
    req: ExpressRequestDto
  ) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      //Update
      const dataContactForm = await this.contactFormService.findOne({ _id: updateStatusContactForm });
      // if (dataContactForm?.note === "admin_edit") {
      //   if (!(await this.userPermissionService.isHavePermission(userId, "contact_form/update"))) {
      //     throw new BadRequestException("You haven't permission for this Action!");
      //   }
      // }

      const dataReturn = await this.contactFormService.update(updateStatusContactForm);
      if (updateStatusContactForm?.form_status === "choose") {
        //Let data To Count
        const dataToUpdate = {
          _id: dataReturn?.entity_id,
        };
        // await this.postService.updateCount(dataToUpdate, { choose_user: 1 });
      }

      if (updateStatusContactForm?.form_status === "noticed") {
        //Let data To Count
        const dataToUpdate = {
          _id: dataReturn?.entity_id,
        };
        // await this.postService.updateCount(dataToUpdate, { done_user: 1 });
      }

      if (updateStatusContactForm?.form_status === "done") {
        //Let data To Count
        const dataToUpdate = {
          _id: dataReturn?.entity_id,
        };
        // await this.postService.updateCount(dataToUpdate, { done_user: 1 });
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
   * @param res
   * @param req
   * @returns
   */
  async getAllContactFormByAdmin(query: ListContactFormDto, res: Response, req: ExpressRequestDto) {
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
      if (await this.userPermissionService.isHavePermission(userId, "contact_form/list")) {
        //Check Permission
        const dataToFilter = query;
        delete dataToFilter.page;
        delete dataToFilter.limit;
        delete dataToFilter.order_by;
        const dataReturn = await this.contactFormService.filter(dataToFilter, orderByOBject, page, limit);
        const count = await this.contactFormService.count(dataToFilter);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": count })
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
  async getContactFormByUserId(query: ListContactFormDto, id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (id !== userObject._id.toString()) {
        if (!(await this.userPermissionService.isHavePermission(userId, "contact_form/list"))) {
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
      const dataReturn = await this.contactFormService.filter(dataToFilter, orderByOBject, page, limit);
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
  async removeContactForm(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "contact_form/delete")) {
        //Check Permission
        const dataReturn = await this.contactFormService.remove(id);
        //get entity
        // const dataEntity = await this.postService.findById(dataReturn?.entity_id?.toString());
        // let userEntity = dataEntity.user_entity;
        // if (!userEntity) {
        //   userEntity = [];
        // }
        // userEntity = userEntity.filter((value, index) => {
        //   if (value?.toString() == dataReturn?.user_id?.toString()) {
        //     return false;
        //   } else {
        //     return true;
        //   }
        // });
        // const dataUpdate = {
        //   _id: dataReturn?.entity_id?.toString(),
        //   user_entity: userEntity,
        // };
        // console.log(dataUpdate, 'dataUpdate')
        //Update Entity
        // await this.postService.update(dataUpdate);

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
  async handleGetDetailContactForm(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "contact_form/list")) {
        const dataFilter = {
          _id: id,
        };
        //Check Permission
        const dataReturn = await this.contactFormService.findOne(dataFilter);
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
