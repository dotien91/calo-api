import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateChallengeViewDto } from "../dto/create-challenge_view.dto";
import { FilterViewChallengeDto } from "../dto/filter-view_challenge.dto";
import { UpdateChallengeViewDto } from "../dto/update-challenge_view.dto";
import { ChallengeView, ChallengeViewDocument } from "../schemas/challenge_view.schema";

@Injectable()
export class ChallengeViewService {
  constructor(
    @InjectModel(ChallengeView.name)
    private challengeViewModel: Model<ChallengeViewDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser: CreateChallengeViewDto): Promise<ChallengeView> {
    const createdUser = new this.challengeViewModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  async getCondition(filter: FilterViewChallengeDto) {
    let condition: any = {};
    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }
    if (filter.challenge_id) {
      condition = Object.assign(condition, { challenge_id: filter.challenge_id });
    }
    if (filter.challenge_ids) {
      condition = Object.assign(condition, { challenge_id: { $in: filter.challenge_ids } });
    }
    if (filter.user_ids) {
      condition = Object.assign(condition, { user_id: { $in: filter.user_ids } });
    }
    if (filter.module_ids) {
      condition = Object.assign(condition, { module_id: { $in: filter.module_ids } });
    }
    if (filter.module_id) {
      condition = Object.assign(condition, { module_id: filter.module_id });
    }
    if (filter.is_child) {
      condition = Object.assign(condition, { parent_id: { $ne: null } });
    }
    return condition;
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async removeOne(dataToSearch: any): Promise<ChallengeView> {
    return await this.challengeViewModel.findOneAndRemove(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @param projection
   * @returns
   */
  async findById(id: string, projection: any): Promise<ChallengeView> {
    if (!id) {
      return null;
    }
    let dataReturn = await this.challengeViewModel.findById(id, projection);
    return dataReturn;
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(dataToSearch?: any): Promise<ChallengeView[]> {
    return this.challengeViewModel.find(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isWithUser: boolean = false): Promise<ChallengeView> {
    if (isWithUser) {
      return await this.challengeViewModel.findOne(dataToSearch).populate("user_id").exec();
    } else {
      return await this.challengeViewModel.findOne(dataToSearch).exec();
    }
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async filterByUserId(userId: string, userPartners: string[]): Promise<ChallengeView[]> {
    let condition = { user_id: userId, partner_id: { $in: userPartners } };
    return await this.challengeViewModel.find(condition, {}).exec();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async remove(id: string) {
    return await this.challengeViewModel.findByIdAndDelete(id).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: UpdateChallengeViewDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.module_id) {
        return null;
      }
      let dataReturn = await this.challengeViewModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, module_id: dataUpdate.module_id },
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

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async updateWithoutCreate(dataUpdate: UpdateChallengeViewDto) {
    try {
      if (!dataUpdate.user_id && !dataUpdate.module_id) {
        return null;
      }
      let dataReturn = await this.challengeViewModel.findOneAndUpdate(
        { user_id: dataUpdate.user_id, module_id: dataUpdate.module_id },
        { $set: dataUpdate }
      );
      if (dataReturn._id) {
        return { ...dataReturn.toObject(), ...dataUpdate };
      } else {
        return null;
      }
    } catch (e) {
      return e;
    }
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: FilterViewChallengeDto) => {
    try {
      let condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.challengeViewModel.estimatedDocumentCount();
      } else {
        return this.challengeViewModel.countDocuments(condition);
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
  async filter(filter: FilterViewChallengeDto, sortBy: any, page: number, limit: number): Promise<ChallengeView[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.challengeViewModel
      .find(condition)
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
  async filterChallenge(
    filter: FilterViewChallengeDto,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<ChallengeView[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataPopulate = {
      path: "module_id",
      options: { strictPopulate: false },
      populate: [
        {
          path: "media_id",
        },
        {
          path: "ref_id",
        },
      ],
    };
    let dataReturn: any = await this.challengeViewModel
      .find(condition, projection)
      .populate(
        "user_id",
        "user_login display_name user_role user_status user_avatar user_avatar_thumbnail last_active user_active"
      )
      .populate(dataPopulate)
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    if (dataReturn && dataReturn?.length) {
      let dataFinalToReturn = [];
      for (let dataItem of dataReturn) {
        let dataItemToReturn = { ...dataItem?.toObject(), ...dataItem.module_id?.toObject() };
        delete dataItemToReturn.module_id;
        dataFinalToReturn.push(dataItemToReturn);
      }
      return dataFinalToReturn;
    } else {
      return [];
    }
  }

  /**
   *
   * @param filter
   * @param sortBy
   * @param page
   * @param limit
   * @returns
   */
  async filterWithId(filter: FilterViewChallengeDto, page: number, limit: number): Promise<ChallengeView[]> {
    let condition = await this.getCondition(filter);
    let sortObject: any = { _id: -1 };
    let dataReturn = await this.challengeViewModel
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
  async filterUser(filter: FilterViewChallengeDto, sortBy: any, page: number, limit: number) {
    let condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    let dataReturn = await this.challengeViewModel
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
    return dataReturn;
  }
}
