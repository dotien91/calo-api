import { Injectable } from "@nestjs/common";
import { UserLocationHistory, UserLocationHistoryDocument } from "../schemas/user_location_history.schema";
import { CreateUserLocationDto } from "../dto/create-user_location.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdateUserLocationDto } from "../dto/update-user_location.dto";
import { FilterFollowDto } from "../dto/filter-follow.dto";
import { FilterUserLocationDto } from "../dto/filter-user_location.dto";

@Injectable()
export class UserLocationService {
  constructor(
    @InjectModel(UserLocationHistory.name)
    private userFollowModel: Model<UserLocationHistoryDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateUserLocationDto): Promise<UserLocationHistory> {
    const createdUser = new this.userFollowModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterUserLocationDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.from && filter.to) {
      let dateFrom = new Date(filter.from);
      let dateTo = new Date(filter.to);
      condition = Object.assign(condition, { createdAt: { $gte: dateFrom, $lte: dateTo } });
    }

    if (
      filter.latitude &&
      filter.longitude &&
      parseFloat(filter?.latitude?.toString()) != -1 &&
      parseFloat(filter?.longitude?.toString()) != -1
    ) {
      const oneKilometer = 0.009043692793;
      let radius = 1000;
      if (filter.distance) {
        radius = Number(filter.distance);
      }

      let maxLatitude = parseFloat(filter?.latitude?.toString()) + oneKilometer * radius;
      let minLatitude = parseFloat(filter?.latitude?.toString()) - oneKilometer * radius;
      let maxLongitude = parseFloat(filter?.longitude?.toString()) + oneKilometer * radius;
      let minLongitude = parseFloat(filter?.longitude?.toString()) - oneKilometer * radius;
      condition = Object.assign(condition, { latitude: { $gte: minLatitude, $lte: maxLatitude } });
      condition = Object.assign(condition, { longitude: { $gte: minLongitude, $lte: maxLongitude } });
    }

    return condition;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async removeOne(dataToSearch: any): Promise<UserLocationHistory> {
    return await this.userFollowModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<UserLocationHistory> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.userFollowModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<UserLocationHistory[]> {
    return this.userFollowModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<UserLocationHistory> {
    if (isWithUser) {
      return await this.userFollowModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.userFollowModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<UserLocationHistory[]> {
    let condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.userFollowModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.userFollowModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateUserLocationDto) {
    try {
      // if (!dataUpdate.user_id && !dataUpdate.partner_id) {
      //   return null;
      // }
      // let dataReturn = await this.userFollowModel.findOneAndUpdate(
      //   { user_id: dataUpdate.user_id, partner_id: dataUpdate.partner_id },
      //   { $set: dataUpdate },
      //   { upsert: true, new: true, setDefaultsOnInsert: true }
      // );
      // if (dataReturn._id) {
      //   return { ...dataReturn.toObject(), ...dataUpdate };
      // } else {
      //   return dataReturn;
      // }
    } catch (e) {
      return e;
    }
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async updateWithoutCreate(dataUpdate: UpdateUserLocationDto) {
    try {
      // if (!dataUpdate.user_id && !dataUpdate.partner_id) {
      //   return null;
      // }
      // let dataReturn = await this.userFollowModel.findOneAndUpdate(
      //   { user_id: dataUpdate.user_id, partner_id: dataUpdate.partner_id },
      //   { $set: dataUpdate }
      // );
      // if (dataReturn._id) {
      //   return { ...dataReturn.toObject(), ...dataUpdate };
      // } else {
      //   return null;
      // }
    } catch (e) {
      return e;
    }
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: FilterFollowDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.userFollowModel.estimatedDocumentCount();
      } else {
        return this.userFollowModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: any) {
    let sort = { priority: -1 };
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.updatedAt) {
      sort = Object.assign(sort, { updatedAt: sortBy.updatedAt === "DESC" ? -1 : 1 });
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
  async filter(
    filter: FilterUserLocationDto,
    sortBy: any,
    page: number,
    limit: number
  ): Promise<UserLocationHistory[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.userFollowModel
      .find(condition)
      .populate({
        path: "user_id",
        options: { strictPopulate: false },
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
        populate: { path: "user_option_id" },
      })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();

    if (dataReturn?.length > 0) {
      let dataReturnAfter = [];
      let newLatitude = filter.latitude;
      let newLongitude = filter.longitude;

      for (let userItem of dataReturn) {
        if (userItem?.toObject()?._id?.toString()) {
          let distance = 0;
          if (
            newLatitude &&
            newLongitude &&
            parseFloat(newLatitude.toString()) != -1 &&
            parseFloat(newLongitude.toString()) != -1
          ) {
            distance = this.getDistanceFromLatLonInMeter(
              newLatitude,
              newLongitude,
              parseFloat(userItem?.toObject()?.latitude?.toString()),
              parseFloat(userItem?.toObject()?.longitude?.toString())
            );
          }
          //delete dataToProcess.loc;
          dataReturnAfter.push({ ...userItem?.toObject(), ...{ distance: distance } });
        }
      }
      return dataReturnAfter;
    } else {
      return [];
    }
  }

  getDistanceFromLatLonInMeter(lat1: number, lon1: number, lat2: number, lon2: number) {
    let R = 6371; // Radius of the earth in km
    let dLat = this.deg2rad(lat2 - lat1); // deg2rad below
    let dLon = this.deg2rad(lon2 - lon1);
    let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c * 1000; // Distance in meter
    return d;
  }

  deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  /**
   *
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterWithId(filter: FilterFollowDto, page: number, limit: number): Promise<UserLocationHistory[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any = { _id: -1 };
    let dataReturn = await this.userFollowModel
      .find(condition, { user_id: true })
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterUser(filter: FilterFollowDto, sortBy: any, page: number, limit: number, isPopulate: boolean = true) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataPopulate: any = {
      path: "user_id",
    };
    if (isPopulate) {
      dataPopulate = {
        path: "user_id",
        options: { strictPopulate: false },
        select:
          "_id bio description user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active",
        populate: { path: "user_option_id" },
      };
    }
    let dataReturn = await this.userFollowModel
      .find(condition)
      .populate(dataPopulate)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }
}
