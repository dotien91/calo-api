import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateFaceDetectionDto } from "../dto/create-face_detection.dto";
import { SearchFaceDetectionDto } from "../dto/search-face_detection.dto";
import { SortByFaceDetectionDto } from "../dto/sort_by-face_detection.dto";
import { UpdateFaceDetectionDto } from "../dto/update-face_detection.dto";
import { FaceDetection, FaceDetectionDocument } from "../schemas/face_detection.schema";

@Injectable()
export class FaceDetectionService {
  constructor(
    @InjectModel(FaceDetection.name)
    private FaceDetectionModel: Model<FaceDetectionDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: SearchFaceDetectionDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }

    if (Number(filter.is_today)) {
      let currentTime = Math.floor(Date.now() / 1);
      let timeToCompare = currentTime - 24 * 60 * 60 * 1000;
      let dateToCompare = new Date(timeToCompare);
      condition = Object.assign(condition, { createdAt: { $gt: dateToCompare } });
    }

    return condition;
  }

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: SortByFaceDetectionDto) {
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
  async filter(filter: SearchFaceDetectionDto, sortBy: SortByFaceDetectionDto, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.FaceDetectionModel.find(condition)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
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
  public count = async (filter: SearchFaceDetectionDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.FaceDetectionModel.estimatedDocumentCount();
      } else {
        return this.FaceDetectionModel.countDocuments(condition);
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
  async create(createUser: CreateFaceDetectionDto) {
    const createdFaceDetection = new this.FaceDetectionModel(createUser);
    let dataCreate = await createdFaceDetection.save();
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
  async findAll(dataToSearch?: any): Promise<FaceDetection[]> {
    return this.FaceDetectionModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<FaceDetection> {
    return await this.FaceDetectionModel.findOne(dataToSearch).sort({ _id: -1 }).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<FaceDetection> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.FaceDetectionModel.findById(objectId)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.FaceDetectionModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateFaceDetectionDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.FaceDetectionModel.findByIdAndUpdate(
        dataUpdate._id,
        { $set: dataUpdate },
        { new: true }
      );
      return dataReturn;
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
