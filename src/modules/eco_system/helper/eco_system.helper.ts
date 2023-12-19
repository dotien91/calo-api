import { Response } from "express";
import { ForbiddenException, HttpStatus, NotFoundException, Injectable, BadRequestException } from "@nestjs/common";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateEcoSystemDto } from "../dto/create-eco_system.dto";
import { EcoSystemService } from "../services/eco_system.service";
import { ListEcoSystemDto } from "../dto/list-eco_system.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateEcoSystemDto } from "../dto/update-eco_system.dto";
import * as _ from "lodash";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class EcoSystemHelper {
  constructor(private ecoSystemService: EcoSystemService, private userPermissionService: UserPermissionService) {}

  async updateEcosystem() {
    try {
      const dataEcosystem = await this.ecoSystemService.filter({}, {}, 1, 1000);
      for (const itemEcosystem of dataEcosystem) {
        // console.log(itemEcosystem?.id)
        const dataUrlAndroid = "https://play.google.com/store/apps/details?id=" + itemEcosystem.id;
        const dataIOS = "https://apps.apple.com/developer/iceo-technology-joint-stock/id1449105284";
        const dataUpdate = {
          _id: itemEcosystem?._id,
          link: {
            android: dataUrlAndroid,
            ios: dataIOS,
            website: "",
          },
        };
        const dataLength = Object.keys(itemEcosystem?.des).length;
        if (!dataLength) {
          const dataUpdateDes = {
            _id: itemEcosystem?._id,
            des: {
              "com.taki.lgbt.whiteg":
                "Discover more engaging conversation topics and effortlessly charm someone with AIChatPro. And if you need someone to talk to or confide in, I'm here for you.",
              "com.taki.tarotapp":
                "Explore numerology, star maps, astrology, and physiognomy further with the help of AIChatPro.",
              "com.iceo.creator.ai":
                "Start a new conversations and effortlessly win over someone's heart with ChatGPT's fun and interesting topic suggestions.",
              "com.iceo.law.ai":
                "Start a new conversations and effortlessly win over someone's heart with ChatGPT's fun and interesting topic suggestions.",
            },
          };
          await this.ecoSystemService.update(dataUpdateDes);
        }
        if (!itemEcosystem?.link) {
          await this.ecoSystemService.update(dataUpdate);
        }
      }
    } catch (error) {}
  }
  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewEcoSystem(createEcoSystemData: CreateEcoSystemDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      //Check Update
      if (await this.userPermissionService.isHavePermission(userId, "config/list")) {
        if (createEcoSystemData.des) {
          createEcoSystemData = { ...createEcoSystemData, ...{ des: JSON.parse(createEcoSystemData.des) } };
        }
        if (createEcoSystemData.feature) {
          createEcoSystemData = { ...createEcoSystemData, ...{ feature: JSON.parse(createEcoSystemData.feature) } };
        }
        if (createEcoSystemData.link) {
          createEcoSystemData = { ...createEcoSystemData, ...{ link: JSON.parse(createEcoSystemData.link) } };
        }

        if (createEcoSystemData.public_album) {
          createEcoSystemData = {
            ...createEcoSystemData,
            ...{ public_album: JSON.parse(createEcoSystemData.public_album) },
          };
        }

        if (createEcoSystemData.white_list) {
          createEcoSystemData = {
            ...createEcoSystemData,
            ...{ white_list: JSON.parse(createEcoSystemData.white_list) },
          };
        }
        const dataCreate = await this.ecoSystemService.create(createEcoSystemData);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataCreate);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getEcoSystemListByAdmin(query: ListEcoSystemDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 10) {
        query.limit = 10;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;

      const orderBy = <"DESC" | "ASC">query?.order_by ? query.order_by : "DESC";

      const configByOBject = {
        createdAt: orderBy,
      };

      const dataToFilter = { ...query };
      const isWhiteList = false;
      const dataWhiteListToSort = [];
      // if (query?.white_list) {
      //   isWhiteList = true;
      //   let dataWhiteList = await this.ecoSystemService.findOne({ id: dataToFilter?.white_list });
      //   let whiteListArray = dataWhiteList?.white_list?.toString().split(",");
      //   dataWhiteListToSort = whiteListArray;
      //   //Convert to Array
      //   delete dataToFilter.white_list;
      //   dataToFilter = {...dataToFilter, ...{ids: whiteListArray}}
      // }
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.ecoSystemService.filter(dataToFilter, configByOBject, page, limit);
      const dataCount = await this.ecoSystemService.count(dataToFilter);

      // if (isWhiteList) {
      //   dataReturn = _.sortBy(dataReturn, function(item:any){
      //     return dataWhiteListToSort.indexOf(item.id)
      //   });
      // }

      //Update
      if (dataReturn) {
        const dataIds = [];
        for (const itemReturn of dataReturn) {
          dataIds.push(itemReturn?._id);
        }
        const dataFilter = { _id: { $in: dataIds } };
        await this.ecoSystemService.updateCount(dataFilter, { view_count: 1 });
      }
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getEcoSystemListByUser(type: string, query: ListEcoSystemDto, res: Response, req: ExpressRequestDto) {
    try {
      const dataToFilter = { id: type };
      const dataReturnEcoSystem: any = await this.ecoSystemService.findOne(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturnEcoSystem);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleDeleteEcoSystem(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "config/delete")) {
        //Check Permission
        const dataReturn = await this.ecoSystemService.remove(id);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleGetDetailEcoSystem(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      //Check Permission
      const dataReturn = await this.ecoSystemService.findById(id.toString());
      if (await this.userPermissionService.isHavePermission(userId, "config/list")) {
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleUpdateEcoSystemByAdmin(dataUpdate: UpdateEcoSystemDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      //Check Permission
      if (await this.userPermissionService.isHavePermission(userId, "config/update")) {
        if (dataUpdate.des) {
          dataUpdate = { ...dataUpdate, ...{ des: JSON.parse(dataUpdate.des) } };
        }
        if (dataUpdate.feature) {
          dataUpdate = { ...dataUpdate, ...{ feature: JSON.parse(dataUpdate.feature) } };
        }
        if (dataUpdate.link) {
          dataUpdate = { ...dataUpdate, ...{ link: JSON.parse(dataUpdate.link) } };
        }
        if (dataUpdate.white_list) {
          dataUpdate = { ...dataUpdate, ...{ white_list: JSON.parse(dataUpdate.white_list) } };
        }

        if (dataUpdate.public_album) {
          dataUpdate = { ...dataUpdate, ...{ public_album: JSON.parse(dataUpdate.public_album) } };
        }
        const dataReturn = await this.ecoSystemService.update(dataUpdate);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
