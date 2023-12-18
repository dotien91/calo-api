import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserOptionDto } from "../dto/create-user_option.dto";
import { SortByUserOptionDto } from "../dto/sort_by-user_option.dto";
import { UserOption, UserOptionDocument } from "../schemas/user_option.schema";
import { SearchBaseUserDto } from "../dto/search-base_user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { UpdateUserOptionDto } from "../dto/update-user_option.dto";
import { SearchAdminFilterDto } from "../dto/search-admin_filter.dto";
import * as turf from "@turf/turf";
import * as _ from "lodash";
import parsePhoneNumber from "libphonenumber-js";

@Injectable()
export class UserOptionService {
  constructor(
    @InjectModel(UserOption.name)
    private userOptionModel: Model<UserOptionDocument>
  ) { }

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateUserOptionDto): Promise<UserOption> {
    const createdUser = new this.userOptionModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<UserOption[]> {
    return this.userOptionModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<UserOption> {
    return await this.userOptionModel.findOne(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filter(filter: SearchBaseUserDto, sortBy: SortByUserOptionDto, page: number, limit: number) {
    let condition = await this.getConditionBase(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};
    let dataReturn = await this.userOptionModel
      .find(condition, projection)
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
  async getConditionBase(filter: SearchBaseUserDto) {
    let condition: any = { user_id: { $ne: null }, user_status: 1 };
    if (filter.user_birthday_year) {
      if (filter.user_birthday_year.indexOf("_") !== -1) {
        let dataObject = filter.user_birthday_year?.split("_");
        if (dataObject && dataObject[0] && dataObject[1]) {
          condition = Object.assign(condition, { user_birthday_year: { $gt: dataObject[0], $lt: dataObject[1] } });
        }
      } else {
        condition = Object.assign(condition, { user_birthday_year: filter.user_birthday_year });
      }
    }

    if (filter.from && filter.to) {
      let dateFrom = new Date(filter.from);
      let dateTo = new Date(filter.to);
      condition = Object.assign(condition, { createdAt: { $gte: dateFrom, $lte: dateTo } });
    }

    if (filter.not_circle_point) {
      condition = Object.assign(condition, { circle_point: { $ne: 0 } });
    }

    if (filter.base_height) {
      if (filter.base_height.indexOf("_") !== -1) {
        let dataObject = filter.base_height?.split("_");
        if (dataObject && dataObject[0] && dataObject[1]) {
          condition = Object.assign(condition, { base_height: { $gt: dataObject[0], $lt: dataObject[1] } });
        }
      } else {
        condition = Object.assign(condition, { base_height: filter.base_height });
      }
    }

    if (filter.locking_for) {
      if (filter.locking_for.indexOf(",") !== -1) {
        let dataObject = filter.locking_for?.split(",");
        if (dataObject?.length) {
          condition = Object.assign(condition, { locking_for: { $in: dataObject } });
        }
      } else {
        condition = Object.assign(condition, { locking_for: filter.locking_for });
      }
    }

    if (filter.unset) {
      condition = Object.assign(condition, { user_id: { $nin: filter.unset } });
    }

    if (filter.user_ids) {
      condition = Object.assign(condition, { user_id: { $in: filter.user_ids } });
    }

    if (filter?.is_validate_phone) {
      condition = Object.assign(condition, {
        is_validate_phone: String(filter?.is_validate_phone) === "true" ? true : false,
      });
    }

    if (filter.base_weight) {
      if (filter.base_weight.indexOf("_") !== -1) {
        let dataObject = filter.base_weight?.split("_");
        if (dataObject && dataObject[0] && dataObject[1]) {
          condition = Object.assign(condition, { base_weight: { $gt: dataObject[0], $lt: dataObject[1] } });
        }
      } else {
        condition = Object.assign(condition, { base_weight: filter.base_weight });
      }
    }
    if (filter.base_role) {
      if (process.env.BRANCH_NAME === "whiteg") {
        if (this.isJsonString(filter.base_role)) {
          let dataFilter = JSON.parse(filter.base_role);
          if (dataFilter && dataFilter.length) {
            condition = Object.assign(condition, { base_role: { $in: this.getBaseRoleLGBT(filter.base_role) } });
          }
        } else {
          condition = Object.assign(condition, { base_role: this.getBaseRoleItemLGBT(filter.base_role) });
        }
      } else {
        if (this.isJsonString(filter.base_role)) {
          let dataFilter = JSON.parse(filter.base_role);
          if (dataFilter && dataFilter.length) {
            //dataFilter.push("");
            condition = Object.assign(condition, { base_role: { $in: dataFilter } });
          }
        } else {
          //let dataBaseRoleFilter = [filter.base_role, ""];
          condition = Object.assign(condition, { base_role: filter.base_role });
        }
      }
    }

    if (process.env.BRANCH_NAME === "live_video" && filter.base_role === "women") {
      condition = Object.assign(condition, { avatar_gender: "female" });
    }

    if (filter.block_users) {
      condition = Object.assign(condition, { user_id: { $nin: filter.block_users } });
    }

    if (filter.is_avatar) {
      condition = Object.assign(condition, { is_avatar: 1 });
    }

    if (filter.ready_status) {
      condition = Object.assign(condition, { ready_status: Number(filter.ready_status) });
    }

    if (
      ((filter.latitude && filter.longitude) || filter.is_smart || filter.user_active || filter.is_match) &&
      process.env.BRANCH_NAME !== "live_video" &&
      process.env.BRANCH_NAME !== "ishare"
    ) {
      condition = Object.assign(condition, { is_avatar: 1, circle_point: { $lt: 20 } });
      let currentTime = new Date().getTime();
      let lastTime = currentTime - 1000 * 60 * 60 * 24 * 20;

      //Total Time in day!
      let newTime = new Date(lastTime);
      condition = Object.assign(condition, { last_active: { $gte: newTime } });
    }

    if (Number(filter.limit) !== 1 && process.env.BRANCH_NAME === "live_video" && filter.base_role === "women") {
      condition = Object.assign(condition, { is_avatar: 1 });
    }

    if (filter.is_circle_point) {
      condition = Object.assign(condition, { circle_point: { $lt: 20 } });
    }

    if (filter.body_type) {
      if (this.isJsonString(filter.body_type)) {
        let dataFilter = JSON.parse(filter.body_type);
        if (dataFilter && dataFilter.length) {
          condition = Object.assign(condition, { body_type: { $in: dataFilter } });
        }
      } else {
        condition = Object.assign(condition, { body_type: filter.body_type });
      }
    }

    if (!Number(filter.sexual_content)) {
      condition = Object.assign(condition, { sexual_content: 0 });
    }

    if (filter.language) {
      if (this.isJsonString(filter.language)) {
        let dataFilter = JSON.parse(filter.language);
        if (dataFilter && dataFilter.length) {
          condition = Object.assign(condition, { language: { $in: dataFilter } });
        }
      } else {
        condition = Object.assign(condition, { language: filter.language });
      }
    }

    if (filter.relationship_status) {
      if (this.isJsonString(filter.relationship_status)) {
        let dataFilter = JSON.parse(filter.relationship_status);
        if (dataFilter && dataFilter.length) {
          condition = Object.assign(condition, { relationship_status: { $in: dataFilter } });
        }
      } else {
        condition = Object.assign(condition, { relationship_status: filter.relationship_status });
      }
    }

    if (filter.online_time) {
      let currentTime = Math.floor(Date.now() / 1);
      let timeToCompare = currentTime - filter.online_time * 60 * 1000;
      let dateToCompare = new Date(timeToCompare);
      condition = Object.assign(condition, { last_active: { $gt: dateToCompare } });
    }

    if (filter.user_interest) {
      condition = Object.assign(condition, { user_interest: filter.user_interest });
    }

    if (filter.user_active) {
      condition = Object.assign(condition, { user_active: filter.user_active });
    }

    if (filter.country) {
      condition = Object.assign(condition, { country: filter.country });
    }

    if (filter.city) {
      if (filter.is_guest) {
        condition = Object.assign(condition, { join_cities: filter.city });
      } else {
        condition = Object.assign(condition, { city: filter.city });
      }
    }

    let maxDistance = 5000000;
    if (filter.distance) {
      maxDistance = filter.distance * 1000;
    }
    let minDistanceForFilter = 0;
    if (filter.user_active) {
      minDistanceForFilter = 10000;
    }
    if (
      filter.latitude &&
      filter.longitude &&
      Number(filter.limit) !== 1 &&
      !filter.is_smart &&
      !filter.is_match &&
      parseFloat(filter?.latitude?.toString()) != -1 &&
      parseFloat(filter?.longitude?.toString()) != -1
    ) {
      // condition = Object.assign(condition, {
      //   loc: {
      //     $near: {
      //       $geometry: {
      //         type: "Point",
      //         coordinates: [filter.longitude, filter.latitude],
      //       },
      //       $minDistance: minDistanceForFilter,
      //       $maxDistance: maxDistance,
      //     },
      //   },
      // });
    }
    if (
      filter.latitude &&
      filter.longitude &&
      Number(filter.limit) !== 1 &&
      // filter.is_match &&
      !filter.city &&
      parseFloat(filter?.latitude?.toString()) != -1 &&
      parseFloat(filter?.longitude?.toString()) != -1 &&
      process.env.BRANCH_NAME !== "live_video"
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

      //let page = filter.page;
      // let center = [parseFloat(filter.longitude.toString()), parseFloat(filter.latitude.toString())];
      // let radius = 100;
      // if (filter.distance) {
      //   radius = Number(filter.distance);
      // }
      // radius = Math.round(radius);
      // let options = { steps: 10, units: "kilometers" };
      // //@ts-ignore
      // let circle = turf.circle(center, radius, options);
      // condition = Object.assign(condition, {
      //   loc: {
      //     $geoWithin: {
      //       $geometry: circle.geometry,
      //     },
      //   },
      // });
    }
    if (
      filter.latitude &&
      filter.longitude &&
      filter.is_smart &&
      Number(filter.limit) !== 1 &&
      parseFloat(filter?.latitude?.toString()) != -1 &&
      parseFloat(filter?.longitude?.toString()) != -1
    ) {
      let minDistance = 10000;
      if (maxDistance < 10000) {
        maxDistance = 11000;
      }
      if (maxDistance >= 1000000) {
        maxDistance = 1000000;
      }

      condition = Object.assign(condition, {
        loc: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [filter.longitude, filter.latitude],
            },
            $maxDistance: maxDistance,
            $minDistance: minDistance,
          },
        },
      });
    }
    return condition;
  }

  /**
   *
   * @param str
   * @returns
   */
  isJsonString(str: string) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  /**
   *
   * @param baseRole
   * @returns
   */
  getBaseRoleLGBT(baseRole: string) {
    try {
      let dataReturn = [];
      if (this.isJsonString(baseRole)) {
        let dataFilter = JSON.parse(baseRole);
        if (dataFilter && dataFilter.length) {
          for (let dataFilterItem of dataFilter) {
            let dataArray = this.getBaseRoleItemLGBT(dataFilterItem);
            dataReturn = _.union(dataReturn, dataArray);
          }
        }
      }
      return dataReturn;
    } catch (error) {
      return baseRole;
    }
  }

  /**
   *
   * @param baseRole
   * @returns
   */
  getBaseRoleItemLGBT(baseRole: string) {
    let dataReturn = ["top", "bottom", "vers_top", "versatile", "ves_bottom", ""];

    return dataReturn.filter((value: string, index: number) => {
      if (baseRole === "top") {
        if (value === "bottom") {
          return false;
        } else {
          return true;
        }
      }
      if (baseRole === "bottom") {
        if (value === "top") {
          return false;
        } else {
          return true;
        }
      }
      return true;
    });
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: SearchBaseUserDto) => {
    try {
      let condition = await this.getConditionBase(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.userOptionModel.estimatedDocumentCount();
      } else {
        return this.userOptionModel.countDocuments(condition);
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
  getSort(sortBy: SortByUserOptionDto) {
    let sort = {};
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
  async filterFree(filter: SearchBaseUserDto, sortBy: SortByUserOptionDto, page: number, limit: number) {
    if (process.env.BRANCH_NAME === "live_video" && Number(limit) === 1) {
      filter = { ...filter, ...{ is_match: "1" } };
    }
    let condition = await this.getConditionBase({ ...filter, ...{ page: page } });

    let sortObject: any = {};
    if (
      sortBy &&
      ((!parseFloat(filter?.latitude?.toString()) && !parseFloat(filter?.longitude?.toString())) ||
        (parseFloat(filter?.latitude?.toString()) == -1 && parseFloat(filter?.longitude?.toString()) == -1))
    ) {
      sortObject = this.getSort(sortBy);
    }

    if (filter.user_spotlight) {
      sortObject = Object.assign(sortObject, { user_spotlight: -1, updateAt: -1 });
    }
    if (filter.is_smart) {
      sortObject = Object.assign(sortObject, { updateAt: -1 });
    }

    if (filter.is_match) {
      sortObject = Object.assign(sortObject, { circle_point: 1 });
    }

    if (process.env.BRANCH_NAME === "live_video") {
      sortObject = Object.assign(sortObject, { last_active: -1 });
    }

    let projection = { _id: false, __v: false };

    let populateObject = {
      path: "user_id",
      options: { strictPopulate: false },
      select:
        "user_login display_name user_version user_role user_status user_avatar user_avatar_thumbnail last_active user_active bio description public_sound notification_status message_stranger",
    };
    let populateAlbum = {
      path: "public_album",
      options: { strictPopulate: false },
      select: "media_url _id media_type media_thumbnail media_square media_mime_type media_meta",
    };

    let populatePrivateAlbum = {
      path: "private_album",
      options: { strictPopulate: false },
      select: "media_url _id media_type media_thumbnail media_square media_mime_type media_meta",
    };

    if (Number(limit) == 1 && process.env.BRANCH_NAME === "live_video") {
      let countData = await this.count(filter);
      page = Math.floor(Math.random() * (countData - 1 + 1) + 1);
    }
    let skip = limit * (page - 1);
    let currentTime = new Date().getTime();
    let dataReturn = await this.userOptionModel
      .find(condition, projection)
      .populate(populateObject)
      .populate(populateAlbum)
      .populate(populatePrivateAlbum)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .exec();

    if (dataReturn?.length > 0) {
      let dataReturnAfter = [];
      let newLatitude = filter.latitude;
      let newLongitude = filter.longitude;
      if (Number(filter?.is_map) == 1) {
        newLatitude = filter.latitude_original;
        newLongitude = filter.longitude_original;
      }
      for (let userItem of dataReturn) {
        if (userItem?.toObject()?.user_id?.toString()) {
          let dataUserId = userItem?.toObject().user_id;
          let dataToProcess = userItem?.toObject();
          let userLocation = userItem?.toObject()?.loc?.coordinates;
          let distance = 0;
          if (userLocation && userLocation.length && userLocation[0] && userLocation[0]) {
            if (
              newLatitude &&
              newLongitude &&
              parseFloat(newLatitude.toString()) != -1 &&
              parseFloat(newLongitude.toString()) != -1
            ) {
              //@ts-ignore
              distance = this.getDistanceFromLatLonInMeter(newLatitude, newLongitude, userLocation[1], userLocation[0]);
            }
          }
          delete dataToProcess.user_id;
          //delete dataToProcess.loc;
          dataReturnAfter.push({ ...dataToProcess, ...dataUserId, ...{ distance: distance } });
        }
      }
      let secondTime = new Date().getTime() - currentTime;
      return dataReturnAfter;
    } else {
      return [];
    }
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterForCron(filter: SearchBaseUserDto, page: number, limit: number) {
    let condition = await this.getConditionBase({ ...filter, ...{ page: page } });
    let sortObject: any = {};
    let projection = { _id: false, __v: false };

    let populateObject = {
      path: "user_id",
      options: { strictPopulate: false },
      select:
        "user_login display_name user_version user_role user_status user_avatar user_avatar_thumbnail last_active user_active bio description public_sound notification_status message_stranger",
    };

    if (Number(limit) == 1 && process.env.BRANCH_NAME === "live_video") {
      let countData = await this.count(filter);
      page = Math.floor(Math.random() * (countData - 1 + 1) + 1);
    }
    let skip = limit * (page - 1);

    let dataReturn = await this.userOptionModel
      .find(condition, projection)
      .populate(populateObject)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .exec();

    if (dataReturn?.length > 0) {
      let dataReturnAfter = [];
      for (let userItem of dataReturn) {
        if (userItem?.toObject()?.user_id?.toString()) {
          let dataUserId = userItem?.toObject().user_id;
          let dataToProcess = userItem?.toObject();
          delete dataToProcess.user_id;
          //delete dataToProcess.loc;
          dataReturnAfter.push({ ...dataToProcess, ...dataUserId });
        }
      }
      return dataReturnAfter;
    } else {
      return [];
    }
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterAdmin(filter: SearchAdminFilterDto, sortBy: SortByUserOptionDto, page: number, limit: number) {
    let condition = await this.getConditionBase(filter);
    let sortObject: any = {};
    if (sortBy && !filter.longitude && !filter.latitude) {
      sortObject = this.getSort(sortBy);
    }
    let projection = {};

    let dataReturn = await this.userOptionModel
      .find(condition, projection)
      .populate("user_id")
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: any) {
    try {
      if (!dataUpdate.user_id) {
        return null;
      }
      if (dataUpdate?.loc && dataUpdate?.loc?.coordinates) {
        let longitude = dataUpdate?.loc?.coordinates[0];
        let latitude = dataUpdate?.loc?.coordinates[1];
        if (longitude) {
          dataUpdate = { ...dataUpdate, ...{ longitude: longitude } };
        }
        if (latitude) {
          dataUpdate = { ...dataUpdate, ...{ latitude: latitude } };
        }
      }

      let dataReturn = await this.userOptionModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id },
        { $set: dataUpdate },
        { new: true }
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
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string, projection: any) {
    if (!id) {
      return null;
    }
    projection = { ...projection, ...{ __v: false } };
    let populateObject = {
      path: "user_id",
      options: { strictPopulate: false },
      select:
        "user_login user_phone display_name user_version user_role user_status user_avatar user_avatar_thumbnail last_active user_active bio description follow_users public_sound notification_status message_stranger user_cover is_validate_phone notification_chat notification_user notification_course notification_community",
    };
    let dataReturn = await this.userOptionModel
      .findOne({ user_id: id }, projection)
      .populate(populateObject)
      .populate("public_album")
      .populate("private_album")
      .exec();
    if (dataReturn) {
      let dataReturnObject = dataReturn.toObject();
      let userMainObject = dataReturnObject.user_id;
      //@ts-ignore
      delete dataReturnObject.user_option_id;
      return { ...dataReturnObject, ...userMainObject, ...{ _id: userMainObject._id.toString() } };
    } else {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async getUserInterest(id: string, projection: any) {
    if (!id) {
      return null;
    }
    projection = { ...projection, ...{ __v: false } };
    let dataReturn = await this.userOptionModel
      .findOne({ user_id: id }, projection)
      .populate("public_album")
      .populate("user_interest")
      .populate("private_album")
      .exec();
    return dataReturn;
  }

  /**
   *
   * @param id
   * @param isInc
   * @returns
   */
  async handleUpdateInc(dataFilter: any, dataUpdate: any) {
    if (!dataFilter.user_id) {
      return null;
    }
    try {
      let resultUpdate = await this.userOptionModel.findOneAndUpdate(dataFilter, { $inc: dataUpdate }, { new: true });
      if (Number(resultUpdate?.circle_point) > 0 && Number(resultUpdate?.circle_point) % 5 === 0) {
        let numberSort = Number(resultUpdate?.circle_point) / 5;
        let dataUpdateNew = {
          number_sort: numberSort,
        };
        await this.userOptionModel.findOneAndUpdate(dataFilter, { $inc: dataUpdateNew }, { new: true });
      }
      return resultUpdate;
    } catch (e) {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param dataFilter
   * @returns
   */
  async updateCount(dataFilter: any, dataUpdate: any) {
    try {
      return this.userOptionModel.findOneAndUpdate(dataFilter, { $inc: dataUpdate });
    } catch (e) {
      return null;
    }
  }
}
