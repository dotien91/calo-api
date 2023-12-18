import { Injectable } from "@nestjs/common";
import { LawyerReport, LawyerReportDocument } from "../schemas/lawyer_report.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateLawyerDto } from "../dto/update-lawyer.dto";
import { CreateLawyerDto } from "../dto/create-lawyer.dto";

@Injectable()
export class LawyerReportService {
  constructor(
    @InjectModel(LawyerReport.name)
    private lawyerReportModel: Model<LawyerReportDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateLawyerDto): Promise<LawyerReport> {
    const createdUser = new this.lawyerReportModel(createUser);
    return await createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(): Promise<LawyerReport[]> {
    return this.lawyerReportModel.find().exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<LawyerReport> {
    return await this.lawyerReportModel.findOne(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<LawyerReport> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.lawyerReportModel.findById(objectId).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.lawyerReportModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateLawyerDto) {
    try {
      if (!dataUpdate._id) {
        return null;
      }
      let dataReturn = await this.lawyerReportModel.findByIdAndUpdate(
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
