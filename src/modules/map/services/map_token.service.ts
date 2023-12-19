import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateMapTokenDto } from "../dto/create.map_token.dto";
import { UpdateMapTokenDto } from "../dto/update.map_token.dto";
import { MapToken, MapTokenDocument } from "../schemas/map_token.schema";

@Injectable()
export class MapTokenService {
  constructor(
    @InjectModel(MapToken.name)
    private mapTokenModel: Model<MapTokenDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateMapTokenDto): Promise<MapToken> {
    const createdUser = new this.mapTokenModel(createUser);
    return await createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<MapToken[]> {
    return this.mapTokenModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<MapToken> {
    let currentTime = new Date();
    dataToSearch = {
      ...dataToSearch,
      ...{ expired_at: { $lt: currentTime } },
    };
    return await this.mapTokenModel.findOne(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<MapToken> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.mapTokenModel.findById(objectId).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.mapTokenModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateMapTokenDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.mapTokenModel.findByIdAndUpdate(
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
