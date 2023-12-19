import { Injectable } from "@nestjs/common";
import { Event, EventDocument } from "../schemas/event.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateEventDto } from "../dto/update.event.dto";
import { CreateEventDto } from "../dto/create.event.dto";
import { SearchEventDto } from "../dto/search.event.dto";
import { SortByEventDto } from "../dto/sort_by-event.dto";
import { SearchEventTypeDto } from "../dto/search.event_type.dto";

const dataPopulateLivestream = {
  path: "livestream_id",
  options: { strictPopulate: false },
  populate: [
    {
      path: "avatar",
    },
    {
      path: "media_id",
    },
    {
      path: "product_id",
      populate: [
        {
          path: "avatar",
        },
      ],
    },
  ],
};
@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name)
    private eventModel: Model<EventDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateEventDto): Promise<Event> {
    const createdUser = new this.eventModel(createUser);
    return await createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchEventDto) {
    let condition: any = {};
    let maxDistance = 10000000;

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

    if (filter.type) {
      if (this.isJsonString(filter.type)) {
        let dataFilter = JSON.parse(filter.type);
        if (dataFilter && dataFilter.length) {
          condition = Object.assign(condition, { type: { $in: dataFilter } });
        }
      } else {
        condition = Object.assign(condition, { type: filter.type });
      }
    }

    if (filter.category) {
      if (this.isJsonString(filter.category)) {
        let dataFilter = JSON.parse(filter.category);
        if (dataFilter && dataFilter.length) {
          condition = Object.assign(condition, { category: { $in: dataFilter } });
        }
      } else {
        condition = Object.assign(condition, { category: filter.category });
      }
    }

    if (filter.city) {
      condition = Object.assign(condition, { city: filter.city });
    }

    if (filter.channel_id) {
      condition = Object.assign(condition, { channel_id: filter.channel_id });
    }

    if (filter.distance) {
      maxDistance = filter.distance * 1000;
    }

    // if (filter.date) {
    //   if (filter.date.indexOf(",") !== -1) {
    //     let dataObject = filter.date?.split(",");
    //     if (dataObject && dataObject[0] && dataObject[1]) {
    //       let startDateObject = new Date(dataObject[0]);
    //       let endDateObject = new Date(dataObject[1]);
    //       condition = Object.assign(condition, {
    //         open_date: { $gte: startDateObject },
    //         end_date: { $lte: endDateObject },
    //       });
    //     }
    //   }
    // }

    if (filter.price) {
      if (filter.price.indexOf(",") !== -1) {
        let dataObject = filter.price?.split(",");
        if (dataObject && dataObject[0] && dataObject[1]) {
          condition = Object.assign(condition, {
            $or: [
              { min_price: { $gte: dataObject[0], $lte: dataObject[1] } },
              { max_price: { $gte: dataObject[0], $lte: dataObject[1] } },
            ],
          });
        }
      } else {
        condition = Object.assign(condition, {
          $or: [{ min_price: { $gte: filter.price } }, { max_price: { $lte: filter.price } }],
        });
      }
    }

    if (filter.latitude && filter.longitude) {
      condition = Object.assign(condition, {
        loc: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(filter.longitude.toString()), parseFloat(filter.latitude.toString())],
            },
            $maxDistance: maxDistance,
          },
        },
      });
    }

    if (filter.search) {
      condition = Object.assign(condition, { $text: { $search: filter.search } });
    }
    if (filter.event_ids) {
      condition = Object.assign(condition, { _id: { $in: filter.event_ids } });
    }

    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByEventDto) {
    let sort = { priority: -1 };
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    return sort;
  }

  /**
   *
   * @param lat1
   * @param lon1
   * @param lat2
   * @param lon2
   * @returns
   */
  getDistanceFromLatLonInMeter(lat1: number, lon1: number, lat2: number, lon2: number) {
    try {
      let R = 6371; // Radius of the earth in km
      let dLat = this.deg2rad(lat2 - lat1); // deg2rad below
      let dLon = this.deg2rad(lon2 - lon1);
      let a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      let d = R * c * 1000; // Distance in meter
      return d;
    } catch (error) {
      return 0;
    }
  }

  /**
   *
   * @param deg
   * @returns
   */
  deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  /**
   * @author Tony Vu
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filter(filter: SearchEventDto, sortBy: SortByEventDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    let projection = {};

    if (sortBy && !filter.longitude && !filter.latitude) {
      sortObject = this.getSort(sortBy);
    }

    if (filter.search) {
      sortObject = { score: { $meta: "textScore" }, ...sortObject };
      projection = Object.assign(projection, { score: { $meta: "textScore" } });
    }

    let dataReturn = await this.eventModel
      .find(condition, projection)
      .sort(sortObject)
      .populate("public_album")
      .populate(
        "user_id",
        "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("category")
      .populate(dataPopulateLivestream)
      .populate("type")
      .populate("event_course")
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    if (dataReturn.length > 0) {
      let dataReturnAfter = [];
      for (let eventItem of dataReturn) {
        if (eventItem?.toObject()?._id?.toString()) {
          let dataToProcess = eventItem.toObject();
          let userLocation = eventItem.toObject()?.loc?.coordinates;
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
          dataReturnAfter.push({ ...dataToProcess, ...{ distance: distance } });
        }
      }
      return dataReturnAfter;
    } else {
      return [];
    }
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<Event> {
    return await this.eventModel.findOne(dataToSearch).exec();
  }

  isJsonString(str: string) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: SearchEventDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.eventModel.estimatedDocumentCount();
      } else {
        return this.eventModel.estimatedDocumentCount(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<Event> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.eventModel.findById(objectId).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findByIdPopulate(id: string): Promise<Event> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }

    return await this.eventModel
      .findById(objectId)
      .populate("public_album")
      .populate(
        "user_id",
        "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate("category")
      .populate(dataPopulateLivestream)
      .populate("type")
      .populate("event_course")
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.eventModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateEventDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.eventModel
        .findByIdAndUpdate(dataUpdate._id, { $set: dataUpdate }, { upsert: true, new: true, setDefaultsOnInsert: true })
        .populate("public_album")
        .populate(
          "user_id",
          "user_login display_name user_level user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
        )
        .populate("category")
        .populate("event_course")
        .populate(dataPopulateLivestream)
        .populate("type");
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
      return this.eventModel.findByIdAndUpdate(id, { $inc: { like_number: isInc ? 1 : -1 } }, { new: true });
    } catch (e) {
      return null;
    }
  }
}
