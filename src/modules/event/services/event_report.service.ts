import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateEventDto } from "../dto/create.event.dto";
import { UpdateEventDto } from "../dto/update.event.dto";
import { EventReport, EventReportDocument } from "../schemas/event_report.schema";

@Injectable()
export class EventReportService {
  constructor(
    @InjectModel(EventReport.name)
    private eventReportModel: Model<EventReportDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateEventDto): Promise<EventReport> {
    const createdUser = new this.eventReportModel(createUser);
    return await createdUser.save();
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<EventReport[]> {
    return this.eventReportModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any): Promise<EventReport> {
    return await this.eventReportModel.findOne(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findById(id: string): Promise<EventReport> {
    if (!id) {
      return null;
    }
    let objectId = new Types.ObjectId(id);
    if (!objectId) {
      return null;
    }
    return await this.eventReportModel.findById(objectId).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.eventReportModel.findByIdAndDelete(id).exec();
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
      let dataReturn = await this.eventReportModel.findByIdAndUpdate(
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
