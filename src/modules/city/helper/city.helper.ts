import { Response, Request, response } from "express";
import {
  ForbiddenException,
  HttpStatus,
  NotFoundException,
  Injectable,
  BadRequestException,
  Res,
  Req,
  Param,
} from "@nestjs/common";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateCityDto } from "../dto/create-city.dto";
import { CityService } from "../services/city.service";
import { ListCityDto } from "../dto/list-city.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateCityDto } from "../dto/update-city.dto";
import { SubscribeService } from "../../../modules/subscribe/services/subscribe.service";
import { CreateUserJoinCityDto } from "../dto/create-user_join_city.dto";
import * as _ from "lodash";
import { UserService } from "../../../modules/user/services/user.service";
import { UserJoinCityService } from "../services/user_join_city.service";
// import * as csv from "fast-csv";
import * as fs from "fs";
// import * as path from "path";
import { CrawlCityDto } from "../dto/crawl-city.dto";
import { UserOptionService } from "../../../modules/user/services/user_option.service";
import { UserFilterHelper } from "../../../modules/user/helper/user_filter.helper";
import axios from "axios";
import { ChatRoomService } from "../../../modules/chat_room/services/chat_room.service";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class CityHelper {
  constructor(
    private cityService: CityService,
    private appUserService: UserService,
    private userJoinCityService: UserJoinCityService,
    private userPermissionService: UserPermissionService,
    private userOptionService: UserOptionService,
    private userFilterService: UserFilterHelper,
    private chatRoomService: ChatRoomService
  ) { }

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewCity(createCityData: CreateCityDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      let newDataCreate = await this.processEventData(createCityData);
      let dataCreate = await this.cityService.create(newDataCreate);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async processAvatar(query: CrawlCityDto, res: Response, req: ExpressRequestDto) {
    let limit = query.limit ? query.limit : 1000;
    let page = query.page ? query.page : 1;
    let orderByOBject = {};
    //let dataReturn = await this.cityService.filter({ capital: ["admin", "primary"] }, orderByOBject, page, limit);
    let dataReturn = await this.userOptionService.findAll();
    let countUpdate = 0;
    for (let dataItem of dataReturn) {
      if (dataItem?.loc && dataItem?.loc.coordinates) {
        let longitude = dataItem?.loc?.coordinates[0];
        let latitude = dataItem?.loc?.coordinates[1];
        let dataToUpdate = {
          latitude: latitude,
          longitude: longitude,
          user_id: dataItem?.user_id?.toString(),
        };
        await this.userOptionService.update(dataToUpdate);
        countUpdate++;
      }
    }

    return res
      .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
      .status(HttpStatus.OK)
      .json({ done: true });
  }

  async processCityAvatar(query: CrawlCityDto, res: Response, req: ExpressRequestDto) {
    let limit = query.limit ? query.limit : 1;
    let page = query.page ? query.page : 1;
    let orderByOBject = {};
    let dataReturn = await this.cityService.filter(
      { capital: ["admin", "primary"], have_group: 1 },
      orderByOBject,
      page,
      limit
    );
    for (let dataItem of dataReturn) {

      let cityImage = dataItem?.city_image;

      if (!cityImage) {
        continue;
      }
      let dataUpdate = {
        _id: dataItem.chat_group,
        room_image: cityImage,
      };
      await this.chatRoomService.update(dataUpdate);
    }

    return res
      .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
      .status(HttpStatus.OK)
      .json({ done: true });
  }

  async processThumbnail(query: CrawlCityDto, res: Response, req: ExpressRequestDto) {


    let limit = query.limit ? query.limit : 1000;
    let page = query.page ? query.page : 1;
    let orderByOBject = {};
    let dataReturn = await this.cityService.filter({ capital: ["admin", "primary"] }, orderByOBject, page, limit);
    // let dataReturn = await this.appUserService.findAll();
    let countUpdate = 0;
    for (let dataItem of dataReturn) {

      let dataCount = await this.userOptionService.count({ city: dataItem._id.toString() });

      let dataToUpdate = {
        _id: dataItem._id.toString(),
        user_number: dataCount,
      };
      countUpdate++;
      await this.cityService.update(dataToUpdate);
    }

    return res
      .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
      .status(HttpStatus.OK)
      .json({ done: true });
  }

  async processPeople(query: CrawlCityDto, res: Response, req: ExpressRequestDto) {

    let limit = query.limit ? query.limit : 1000;
    let page = query.page ? query.page : 1;
    let orderByOBject = {};
    //let dataReturn = await this.cityService.filter({ capital: ["admin", "primary"] }, orderByOBject, page, limit);
    let dataReturn = await this.userOptionService.findAll();
    let countUpdate = 0;
    for (let dataItem of dataReturn) {

      if (dataItem.city) {
        let dataToUpdate = {
          _id: dataItem.user_id.toString(),
          city: dataItem.city,
        };
        await this.appUserService.update(dataToUpdate);
        countUpdate++;
      }
    }

    return res
      .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
      .status(HttpStatus.OK)
      .json({ done: true });
  }

  async processCountry(res: Response, req: ExpressRequestDto) {
    let topCountry = [
      {
        iso2: "US",
        name: "United States",
        image:
          "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com/2023/01/05_1672891894083/63623aa9f7dc7af44d76fe3f-1672891894083-usa.jpeg",
      },
      {
        iso2: "PH",
        name: "Philippines",
        image:
          "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com/2023/01/05_1672891894144/63623aa9f7dc7af44d76fe3f-1672891894144-philippines.jpeg",
      },
      {
        iso2: "MY",
        name: "Malaysia",
        image:
          "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com/2023/01/05_1672891894065/63623aa9f7dc7af44d76fe3f-1672891894064-malaysia.jpeg",
      },
      {
        iso2: "IN",
        name: "India",
        image:
          "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com/2023/01/05_1672891894256/63623aa9f7dc7af44d76fe3f-1672891894256-india.webp",
      },
      {
        iso2: "VN",
        name: "Vietnam",
        image:
          "https://media.whiteg.app/lgbtapp.s3.ap-southeast-1.amazonaws.com/2023/01/05_1672891894238/63623aa9f7dc7af44d76fe3f-1672891894238-vietnam.jpeg",
      },
    ];
    return res
      .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
      .status(HttpStatus.OK)
      .json(topCountry);
  }

  async processCity(query: CrawlCityDto, res: Response, req: ExpressRequestDto) {

    let limit = query.limit ? query.limit : 1000;
    let page = query.page ? query.page : 1;
    let orderByOBject = {};
    //let dataReturn = await this.cityService.filter({ capital: ["admin", "primary"] }, orderByOBject, page, limit);
    let dataReturn = await this.userOptionService.findAll();
    let countUpdate = 0;
    for (let dataItem of dataReturn) {

      if (dataItem.loc && dataItem.loc?.coordinates) {
        let cityFind = await this.cityService.filter({ point: dataItem.loc?.coordinates }, {}, 1, 1);
        if (cityFind && cityFind[0]) {
          //Update user
          let dataUpdate = {
            user_id: dataItem.user_id,
            city: cityFind[0]._id.toString(),
          };
          await this.userOptionService.update(dataUpdate);

          //Update City Count
          await this.cityService.handleUpdateUserInc(cityFind[0]._id.toString(), true);
          countUpdate++;
        }
      }

      // let newUpdate = {
      //   is_viewable: 1,
      // };
      // let dataUpdate = { ...dataItem, ...newUpdate };
      // await this.cityService.update(dataUpdate);
      // console.log("UPdate success", countUpdate);

      // let dataNameSearch = [];
      // if (dataItem.names && dataItem.names.length) {
      //   for (let itemName of dataItem.names) {
      //     dataNameSearch.push(itemName.name);
      //   }
      // }

      // if (dataNameSearch && dataNameSearch.length) {
      //   countUpdate++;
      //   let newUpdate = {
      //     index_name: dataNameSearch.join(" ")
      //   }
      //   let dataUpdate = {...dataItem, ...newUpdate};
      //   await this.cityService.update(dataUpdate);
      //   console.log("UPdate success", countUpdate)
      // }

      //await this.cityService.update(dataItem);

      // let link = `https://nominatim.openstreetmap.org/search.php?q=${dataIte}&polygon_geojson=1&format=jsonv2`;
      // // let result = await got.get(link);
      // // if (!result || (result && result.statusCode) !== 200) {
      // //   return false;
      // // }
      // // console.log(result.body);
      // // let $ = cheerio.load(result.body);
    }

    return res
      .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
      .status(HttpStatus.OK)
      .json({ done: true });
  }

  // readCsv(path, options, rowProcessor) {
  //   return new Promise((resolve, reject) => {
  //     const data = [];

  //     csv
  //       .parseFile(path, options)
  //       .on("error", reject)
  //       .on("data", (row) => {
  //         const obj = rowProcessor(row);
  //         if (obj) data.push(obj);
  //       })
  //       .on("end", () => {
  //         resolve(data);
  //       });
  //   });
  // }

  /**
   * @author Tony Vu
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getCityListByAdmin(query: ListCityDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "city/list")) {
        if (Number(query.limit) > 1000) {
          query.limit = 1000;
        }

        let limit = query.limit ? query.limit : 1000;
        let page = query.page ? query.page : 1;
        let orderByOBject = {};
        if (query.order_by) {
          orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
        }
        let dataToFilter = { ...query };
        delete dataToFilter.page;
        delete dataToFilter.limit;
        delete dataToFilter.order_by;
        let dataReturn = await this.cityService.filter(dataToFilter, orderByOBject, page, limit);
        let dataCount = await this.cityService.count(dataToFilter);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
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
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getCityListByUser(query: ListCityDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();

      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query, ...{ user_id: userId } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      if (userObject?.city) {
        dataToFilter = { ...dataToFilter, ...{ unset: [userObject?.city?.toString()] } };
      }

      let dataReturn = await this.cityService.filter(dataToFilter, orderByOBject, page, limit);
      //let dataCount = await this.cityService.count(dataToFilter);
      let dataFinalReturn = [];
      if (dataReturn && dataReturn.length) {
        for (let dataPrepareItem of dataReturn) {
          let isJoin = false;
          let joinCityObject = [];
          if (userObject?.join_cities && userObject?.join_cities?.length) {
            for (let followItem of userObject?.join_cities) {
              joinCityObject.push(followItem.toString());
            }
          }
          if (joinCityObject.indexOf(dataPrepareItem._id.toString()) !== -1) {
            isJoin = true;
          }
          dataFinalReturn.push({ ...dataPrepareItem, ...{ is_join: isJoin } });
        }
      }
      if (parseFloat(query?.latitude?.toString()) && parseFloat(query?.longitude?.toString())) {
        let cityName = "";
        let countryName = "";
        //Update User Option
        let cityObject: any = await this.cityService.findOneWithFilter({
          point: [parseFloat(query.longitude.toString()), parseFloat(query.latitude.toString())],
        });
        if (!cityObject) {
          //Find nearby
          let filterCity = await this.cityService.filter(
            { is_nearby: "1", latitude: query.latitude, longitude: query.longitude },
            {},
            1,
            1
          );
          if (filterCity && filterCity[0]) {
            cityObject = filterCity[0];
          }
        }

        if (cityObject) {
          let oldCity = userObject?.city?.toString();
          if (userObject?.city?.toString() !== cityObject?._id?.toString()) {
            //Update New City
            let dataUpdate = {
              _id: userObject?._id?.toString(),
              old_city: oldCity,
              city: cityObject?._id?.toString(),
              country: cityObject?.country_iso2?.toString(),
            };
            await this.appUserService.update(dataUpdate);
            delete dataUpdate._id;
            dataUpdate = { ...dataUpdate, ...{ user_id: userObject?._id?.toString() } };
            await this.userOptionService.update(dataUpdate);
            //Update Old City
            await this.cityService.handleUpdateUserInc(cityObject?._id?.toString(), true);
            await this.cityService.handleUpdateUserInc(oldCity, false);
            cityName = cityObject?.city_name?.toString();
            countryName = cityObject?.country?.toString();
            this.userFilterService.sendNotificationNew(userObject, req, res, cityName, countryName);
          }
        }
      }
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataFinalReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param query
   * @param res
   * @param req
   * @returns
   */
  async getListClient(query: ListCityDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;

      let dataReturn = await this.cityService.filter(dataToFilter, orderByOBject, page, limit, {
        city_name: 1,
        city_ascii: 1,
        country: 1,
        country_iso2: 1,
        localname: 1,
      });

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
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
  async handleGetDetailCity(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      //Check Permission
      let dataReturn = await this.cityService.findById(id.toString());
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   *
   * @param createEventData
   * @returns
   */
  async processEventData(createEventData: any) {
    if (createEventData.names) {
      createEventData = { ...createEventData, ...{ names: JSON.parse(createEventData.names) } };
    }

    if (createEventData.geometry) {
      createEventData = { ...createEventData, ...{ geometry: JSON.parse(createEventData.geometry) } };
    }

    if (createEventData.latitude && createEventData.longitude) {
      createEventData = {
        ...createEventData,
        ...{
          loc: {
            type: "Point",
            coordinates: [
              parseFloat(createEventData.longitude.toString()),
              parseFloat(createEventData.latitude.toString()),
            ],
          },
        },
      };
    }
    return createEventData;
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleUpdateCityByAdmin(dataUpdate: UpdateCityDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      //Check Permission
      if (await this.userPermissionService.isHavePermission(userId, "city/update")) {
        let newDataCreate = await this.processEventData(dataUpdate);
        let dataReturn = await this.cityService.update(newDataCreate);
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
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processJoinUser(dataFollow: CreateUserJoinCityDto, req: ExpressRequestDto, res: Response) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let dataUpdate = {
        user_id: userObject._id.toString(),
        city_id: dataFollow.city_id.toString(),
      };
      let dataFollowUpdate = [dataFollow.city_id.toString()];
      if (userObject?.join_cities) {
        dataFollowUpdate = _.union(userObject?.join_cities, dataFollowUpdate);
      }
      let dataToUpdate = {
        _id: userObject._id.toString(),
        join_cities: dataFollowUpdate,
      };
      //Update Follow User
      await this.appUserService.update(dataToUpdate);
      delete dataToUpdate._id;
      dataToUpdate = { ...dataToUpdate, ...{ user_id: userObject._id.toString() } };
      await this.userOptionService.update(dataToUpdate);

      await this.cityService.handleUpdateInc(dataFollow.city_id.toString(), true);

      //Count Like
      let dataReturn = await this.userJoinCityService.update(dataUpdate);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processUnJoinUser(dataFollow: CreateUserJoinCityDto, req: ExpressRequestDto, res: Response) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let dataFindOne = {
        user_id: userObject._id.toString(),
        city_id: dataFollow.city_id.toString(),
      };
      let dataToCheck = await this.userJoinCityService.findOne(dataFindOne);

      if (dataToCheck) {
        let dataReturn = await this.userJoinCityService.remove(dataToCheck._id.toString());

        if (userObject?.join_cities) {
          //dataFollowUpdate = _.union(userObject?.follow_users, dataFollowUpdate);
          let dataFollowUpdate = userObject?.join_cities?.filter((value: any, index: number) => {
            if (value?.toString() === dataFollow.city_id.toString()) {
              return false;
            } else {
              return true;
            }
          });
          let dataToUpdate = {
            _id: userObject._id.toString(),
            join_cities: dataFollowUpdate,
          };
          //Update Follow User
          await this.appUserService.update(dataToUpdate);
          delete dataToUpdate._id;
          dataToUpdate = { ...dataToUpdate, ...{ user_id: userObject._id.toString() } };
          await this.userOptionService.update(dataToUpdate);
        } else {
          let dataToUpdate = {
            _id: userObject._id.toString(),
            join_cities: [],
          };
          //Update Follow User
          await this.appUserService.update(dataToUpdate);
          delete dataToUpdate._id;
          dataToUpdate = { ...dataToUpdate, ...{ user_id: userObject._id.toString() } };
          await this.userOptionService.update(dataToUpdate);
        }

        await this.cityService.handleUpdateInc(dataFollow.city_id.toString(), false);

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
}
