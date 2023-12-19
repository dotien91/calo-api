import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateCityDto } from "../dto/create-city.dto";
import { ListCityDto } from "../dto/list-city.dto";
import { SortByCityDto } from "../dto/sort_by-city.dto";
import { UpdateCityDto } from "../dto/update-city.dto";
import { City, CityDocument } from "../schemas/city.schema";

@Injectable()
export class CityService {
  constructor(
    @InjectModel(City.name)
    private cityModel: Model<CityDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: ListCityDto) {
    let condition: any = {};
    if (filter.country) {
      condition = Object.assign(condition, { country: filter.country });
    }
    if (filter.have_group) {
      condition = Object.assign(condition, { chat_group: { $ne: null } });
    }

    if (filter.have_image) {
      condition = Object.assign(condition, { city_image: null });
    }

    if (filter.country_iso2) {
      condition = Object.assign(condition, { country_iso2: filter.country_iso2 });
    }

    if (!filter.is_nearby) {
      // condition = Object.assign(condition, { is_viewable: 1 });
    }

    if (!filter.search && !filter.point && !filter.is_nearby) {
      condition = { ...condition, ...{ user_number: { $gt: 0 } } };
    }
    let maxDistance = 5000000;
    if (filter.distance) {
      maxDistance = Number(filter.distance) * 1000;
    }
    if (filter.capital) {
      condition = Object.assign(condition, { capital: { $in: filter.capital } });
    }
    const minDistanceForFilter = 0;

    if (filter.point) {
      condition = Object.assign(condition, {
        geometry: { $geoIntersects: { $geometry: { type: "Point", coordinates: filter.point } } },
      });
    }

    if (filter.unset) {
      condition = Object.assign(condition, { _id: { $nin: filter.unset } });
    }

    if (filter.latitude && filter.longitude && filter.is_nearby) {
      condition = Object.assign(condition, {
        loc: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [filter.longitude, filter.latitude],
            },
            $minDistance: minDistanceForFilter,
            $maxDistance: maxDistance,
          },
        },
      });
    }

    if (filter.search) {
      const dataSearch = `${filter.search}`;
      const dataRegex = new RegExp("^" + dataSearch.toLowerCase(), "i");
      // console.log(dataRegex);
      // condition = Object.assign(condition, { $text: { $search: dataRegex } });
      condition = Object.assign(condition, { $or: [{ city_name: dataRegex }, { localname: dataRegex }] });
    }

    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByCityDto) {
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
  async filter(filter: ListCityDto, sortBy: SortByCityDto, page: number, limit: number, projection: any = {}) {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy && !parseFloat(filter?.latitude?.toString()) && !parseFloat(filter?.longitude?.toString())) {
      sortObject = this.getSort(sortBy);
    }
    if (!filter.is_nearby) {
      sortObject = { ...sortObject, ...{ user_number: -1 } };
    }
    if (filter.search) {
      // sortObject = { score: { $meta: "textScore" }, ...sortObject };
      // projection = Object.assign(projection, { score: { $meta: "textScore" } });
    }

    const dataReturn = await this.cityModel
      .find(condition, projection)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    const dataReturnAfter = [];
    if (dataReturn.length > 0) {
      for (const userItem of dataReturn) {
        if (userItem?.toObject()?._id?.toString()) {
          //@ts-ignore
          const dataUserId = userItem.toObject().user_id;
          const dataToProcess = userItem.toObject();
          const userLocation = userItem.toObject()?.loc?.coordinates;
          let distance = 0;
          if (userLocation && userLocation.length && userLocation[0] && userLocation[0]) {
            if (filter.latitude && filter.longitude) {
              distance = this.getDistanceFromLatLonInMeter(
                filter.latitude,
                filter.longitude,
                //@ts-ignore
                userLocation[1],
                userLocation[0]
              );
            }
          }
          delete dataToProcess.geometry;
          delete dataToProcess.loc;
          dataReturnAfter.push({ ...dataToProcess, ...dataUserId, ...{ distance: distance } });
        }
      }
    }
    return dataReturnAfter;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: ListCityDto) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.cityModel.estimatedDocumentCount();
      } else {
        return this.cityModel.estimatedDocumentCount(condition);
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
  async create(createUser: CreateCityDto) {
    const createdCity = new this.cityModel(createUser);
    const dataCreate = await createdCity.save();
    return dataCreate;
  }

  /**
   * @author Tony Vu
   * @param userId
   * @returns boolean
   */
  async isSuperAdmin(userId: string) {
    const superAdmin = process.env.SUPER_ADMIN;
    if (superAdmin) {
      const superAdminArray = superAdmin.split(",");
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
  async findAll(dataToSearch?: any): Promise<City[]> {
    return this.cityModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOneWithFilter(dataToSearch: ListCityDto): Promise<City> {
    const condition = await this.getCondition(dataToSearch);
    const projection = {};
    let sortObject = {};
    sortObject = Object.assign(sortObject, { user_number: -1 });
    const dataReturn = await this.cityModel.findOne(condition, projection).sort(sortObject).exec();
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<City> {
    return await this.cityModel.findOne(dataToSearch).sort({ _id: -1 }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<City> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.cityModel.findById(objectId).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.cityModel.findByIdAndDelete(id).exec();
  }

  getDistanceFromLatLonInMeter(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1); // deg2rad below
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c * 1000; // Distance in meter
    return d;
  }

  deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateCityDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      const dataReturn = await this.cityModel.findByIdAndUpdate(
        dataUpdate._id,
        { $set: dataUpdate, $unset: { wiki_result: 1, raw_search: 1, raw_result: 1 } },
        { new: false, multi: true }
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
  /**
   *
   * @param id
   * @param isInc
   * @returns
   */
  async handleUpdateInc(id: string, isInc: boolean) {
    try {
      return this.cityModel.findByIdAndUpdate(id, { $inc: { visit_number: isInc ? 1 : -1 } }, { new: true });
    } catch (e) {
      return null;
    }
  }

  /**
   *
   * @param id
   * @param isInc
   * @returns
   */
  async handleUpdateUserInc(id: string, isInc: boolean) {
    try {
      return this.cityModel.findByIdAndUpdate(id, { $inc: { user_number: isInc ? 1 : -1 } }, { new: true });
    } catch (e) {
      return null;
    }
  }
}
