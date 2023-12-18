import { Injectable } from "@nestjs/common";
import { CreateLawyerDto } from "../dto/create-lawyer.dto";
import { LawyerDocument, Lawyer } from "../schemas/lawyer.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateLawyerDto } from "../dto/update-lawyer.dto";
import { SearchLawyerDto } from "../dto/search-lawyer.dto";
import { SortByLawyerDto } from "../dto/sort_by-lawyer.dto";
import { SearchAdminFilterDto } from "../../../modules/user/dto/search-admin_filter.dto";

@Injectable()
export class LawyerService {
  constructor(
    @InjectModel(Lawyer.name)
    private lawyerModel: Model<LawyerDocument>
  ) { }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchLawyerDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.status) {
      condition = Object.assign(condition, { status: filter.status });
    }

    if (filter.state_name) {
      condition = Object.assign(condition, { state_name: filter.state_name });
    }

    if (filter.city_name) {
      condition = Object.assign(condition, { city_name: filter.city_name });
    }

    if (filter.city) {
      condition = Object.assign(condition, { city: filter.city });
    }

    if (filter.license_year) {
      if (filter.license_year.indexOf("-") !== -1) {
        let dataObject = filter.license_year?.split("-");
        if (dataObject && dataObject[0] && dataObject[1]) {
          condition = Object.assign(condition, {
            license_year: { $gt: Number(dataObject[0]), $lt: Number(dataObject[1]) },
          });
        }
      } else {
        condition = Object.assign(condition, { license_year: Number(filter.license_year) });
      }
    }

    if (filter.categories) {
      if (filter.categories.indexOf(",") !== -1) {
        let dataObject = filter.categories?.split(",");
        let dataToFilterArray = [];
        if (dataObject && dataObject?.length) {
          for (let itemArray of dataObject) {
            dataToFilterArray.push(new Types.ObjectId(itemArray))
          }
          condition = Object.assign(condition, { categories: { $in: dataToFilterArray } });
        }
      } else {
        let categoriesId = new Types.ObjectId(filter.categories);
        condition = Object.assign(condition, { categories: categoriesId });
      }
    }

    if (filter.language_spoken) {
      if (filter.language_spoken.indexOf(",") !== -1) {
        let dataObject = filter.language_spoken?.split(",");
        if (dataObject && dataObject?.length) {
          condition = Object.assign(condition, { "language_spoken.title": { $in: dataObject } });
        }
      } else {
        condition = Object.assign(condition, { "language_spoken.title": filter.language_spoken });
      }
    }

    if (filter.hasOwnProperty("is_free_consultation")) {
      condition = Object.assign(condition, { is_free_consultation: (filter.is_free_consultation == 'true') ? true : false });
    }
    if (filter.hasOwnProperty("open_for_business")) {
      condition = Object.assign(condition, { open_for_business: (filter.open_for_business == 'true') ? true : false });
    }
    if (filter.hasOwnProperty("is_misconduct")) {
      condition = Object.assign(condition, { is_misconduct: (filter.is_misconduct == 'true') ? true : false });
    }
    if (filter.hasOwnProperty("is_extra_virtual")) {
      console.log(filter.is_extra_virtual, 'filter.is_extra_virtual')
      condition = Object.assign(condition, { is_extra_virtual: (filter.is_extra_virtual == 'true') ? true : false });
    }

    if (filter.review_value) {
      condition = Object.assign(condition, { review_value: { $gte: Number(filter.review_value) } });
    }

    if (filter.search) {
      condition = Object.assign(condition, { $text: { $search: filter.search } });
    }


    // if (
    //   filter.latitude &&
    //   filter.longitude
    // ) {
    //   const oneKilometer = 0.009043692793;
    //   let radius = 10000;
    //   if (filter.distance) {
    //     radius = Number(filter.distance);
    //   }

    //   console.log(filter.distance, 'filter.distance')
    //   console.log(radius, 'radius');

    //   let maxLatitude = parseFloat(filter?.latitude?.toString()) + oneKilometer*radius;
    //   let minLatitude = parseFloat(filter?.latitude?.toString()) - oneKilometer*radius;
    //   let maxLongitude = parseFloat(filter?.longitude?.toString()) + oneKilometer*radius;
    //   let minLongitude = parseFloat(filter?.longitude?.toString()) - oneKilometer*radius;
    //   condition = Object.assign(condition, { latitude: {$gte: minLatitude, $lte: maxLatitude} });
    //   condition = Object.assign(condition, { longitude: {$gte: minLongitude, $lte: maxLongitude} });
    // }

    if (
      filter.latitude &&
      filter.longitude &&
      parseFloat(filter?.latitude?.toString()) != -1 &&
      parseFloat(filter?.longitude?.toString()) != -1
    ) {
      let minDistance = 0;
      let maxDistance = 5000000;
      condition = Object.assign(condition, {
        loc: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [filter.longitude?.toString(), filter.latitude?.toString()],
            },
            $minDistance: minDistance,
            $maxDistance: maxDistance,
          },
        },
      });

      // const oneKilometer = 0.009043692793;
      // let radius = 200;
      // if (filter.distance) {
      //   radius = Number(filter.distance);
      // }

      // console.log(filter.distance, 'filter.distance')
      // console.log(radius, 'radius');

      // let maxLatitude = parseFloat(filter?.latitude?.toString()) + oneKilometer*radius;
      // let minLatitude = parseFloat(filter?.latitude?.toString()) - oneKilometer*radius;
      // let maxLongitude = parseFloat(filter?.longitude?.toString()) + oneKilometer*radius;
      // let minLongitude = parseFloat(filter?.longitude?.toString()) - oneKilometer*radius;
      // condition = Object.assign(condition, { latitude: {$gte: minLatitude, $lte: maxLatitude} });
      // condition = Object.assign(condition, { longitude: {$gte: minLongitude, $lte: maxLongitude} });
    }

    return condition;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getConditionAdmin(filter: SearchAdminFilterDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.status) {
      condition = Object.assign(condition, { status: filter.status });
    }
    if (filter.from && filter.to) {
      let dateFrom = new Date(filter.from);
      let dateTo = new Date(filter.to);
      condition = Object.assign(condition, { createdAt: { $gte: dateFrom, $lte: dateTo } });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByLawyerDto) {
    let sort = {
      points: -1
    };
    // if (sortBy.createdAt) {
    //   sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    // }
    if (sortBy.license_year) {
      sort = Object.assign(sort, { license_year: sortBy.license_year === "DESC" ? -1 : 1 });
    }
    if (sortBy.review_number) {
      sort = Object.assign(sort, { review_number: sortBy.review_number === "DESC" ? -1 : 1 });
    }
    if (sortBy.review_value) {
      sort = Object.assign(sort, { review_value: sortBy.review_value === "DESC" ? -1 : 1 });
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
  async filter(filter: SearchLawyerDto, sortBy: SortByLawyerDto, page: number, limit: number, projection: any = {}) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }

    if (filter.search) {
      sortObject = { score: { $meta: "textScore" }, ...sortObject };
      projection = Object.assign(projection, { score: { $meta: "textScore" } });
    }
    console.log(JSON.stringify(condition), 'condition')

    console.log(sortObject, 'sortObject')

    let dataReturn = await this.lawyerModel
      .find(condition, projection)
      .populate(
        "user_id",
        "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("avatar")
      .populate("awards")
      .populate("public_album")
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
  public count = async (filter: SearchLawyerDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.lawyerModel.estimatedDocumentCount();
      } else {
        return this.lawyerModel.countDocuments(condition);
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
  async create(createUser: CreateLawyerDto) {
    const createdLawyer = new this.lawyerModel(createUser);
    let dataCreate = await createdLawyer.save();
    return dataCreate;
  }

  /**
   * @author Tony Vu
   * @param userId
   * @returns boolean
   */
  async isSuperAdmin(userId: string) {
    let superAdmin = process.env.SUPER_ADMIN;
    if (superAdmin) {
      let superAdminArray = superAdmin.split(",");
      if (superAdminArray.indexOf(userId) !== -1) {
        return true;
      }
    }
    return false;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<Lawyer[]> {
    return this.lawyerModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Lawyer> {
    return await this.lawyerModel.findOne(dataToSearch).sort({ _id: -1 }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Lawyer> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.lawyerModel
      .findById(objectId)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("avatar")
      .populate("awards")
      .populate("public_album")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.lawyerModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateLawyerDto, unsetData: any = {}) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.lawyerModel.findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate, $unset: unsetData }, { new: false });
      if (dataReturn._id) {
        return { ...dataReturn.toObject(), ...dataUpdate };
      } else {
        return dataReturn;
      }
    } catch (e) {
      return e;
    }
  }

  /**
   *
   * @param id
   * @param isInc
   * @returns
   */
  async handleUpdateInc(id: string, isInc: boolean) {
    try {
      return this.lawyerModel.findByIdAndUpdate(id, { $inc: { like_number: isInc ? 1 : -1 } }, { new: true });
    } catch (e) {
      return null;
    }
  }
}
