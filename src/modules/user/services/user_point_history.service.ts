import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserPointHistoryDto } from "../dto/create-user_point_history.dto";
import { UserPointHistory, UserPointHistoryDocument } from "../schemas/user_point_history.schema";

@Injectable()
export class UserPointHistoryService {
  constructor(
    @InjectModel(UserPointHistory.name)
    private userPointHistoryModel: Model<UserPointHistoryDocument>
  ) {}

  async create(data: CreateUserPointHistoryDto): Promise<UserPointHistory> {
    const createdUser = new this.userPointHistoryModel(data);
    return createdUser.save();
  }

  async findAll(dataToSearch?: any): Promise<UserPointHistory[]> {
    return this.userPointHistoryModel.find(dataToSearch).exec();
  }

  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<UserPointHistory> {
    if (isWithUser) {
      return await this.userPointHistoryModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.userPointHistoryModel.findOne(dataToSearch).exec();
    }
  }
}
