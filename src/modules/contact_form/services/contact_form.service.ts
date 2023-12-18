import { Injectable } from "@nestjs/common";
import { CreateContactFormDto } from "../dto/create-contact_form.dto";
import { ContactForm, ContactFormDocument } from "../schemas/contact_form.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdateContactFormDto } from "../dto/update-contact_form.dto";
import { SearchContactFormDto } from "../dto/search-contact_form.dto";
import { SortByContactFormDto } from "../dto/sort_by-contact_form.dto";

@Injectable()
export class ContactFormService {
  constructor(
    @InjectModel(ContactForm.name)
    private contactFormModel: Model<ContactFormDocument>
  ) { }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchContactFormDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.entity_id) {
      condition = Object.assign(condition, { entity_id: filter.entity_id });
    }
    if (filter.form_type) {
      condition = Object.assign(condition, { form_type: filter.form_type });
    }
    if (filter.form_status) {
      condition = Object.assign(condition, { form_status: filter.form_status });
    }
    if (filter.partner_id) {
      condition = Object.assign(condition, { partner_id: filter.partner_id });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByContactFormDto) {
    let sort = { priority: -1 };
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    return sort;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filter(filter: SearchContactFormDto, sortBy: SortByContactFormDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }

    let populateObject = {
      path: "entity_id",
      populate: [
        {
          path: "post_avatar",
        },
      ],
    };

    let dataReturn = await this.contactFormModel
      .find(condition)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(
        "partner_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(populateObject)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: SearchContactFormDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.contactFormModel.estimatedDocumentCount();
      } else {
        return this.contactFormModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateContactFormDto): Promise<ContactForm> {
    const createdUser = new this.contactFormModel(createUser);
    return await createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<ContactForm[]> {
    return this.contactFormModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<ContactForm> {

    let populateObject = {
      path: "user_id",
      select: "bio user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
      populate:
      {
        path: "user_option_id",
      }
    };

    return await this.contactFormModel
      .findOne(dataToSearch)
      .populate(populateObject)
      .populate(
        "partner_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("entity_id")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string): Promise<any> {
    return await this.contactFormModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateContactFormDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.contactFormModel.findByIdAndUpdate(
        dataUpdate._id,
        { $set: dataUpdate },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (dataReturn._id) {
        return { ...dataReturn.toObject(), ...dataUpdate };
      } else {
        return dataReturn;
      }
    } catch (e) {
      return e;
    }
  }
}
