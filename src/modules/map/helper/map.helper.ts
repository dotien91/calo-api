import { Request, response, Response } from "express";
import { ForbiddenException, BadRequestException, HttpStatus, NotFoundException, Injectable } from "@nestjs/common";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { SearchMapDto } from "../dto/search.map.dto";
import { MapTokenService } from "../services/map_token.service";
import * as OAuth from "oauth-1.0a";
import * as crypto from "crypto";
import axios from "axios";

/**
 * @author Tony Vu
 * @class MapHelper
 */
@Injectable()
export class MapHelper {
  constructor(private readonly mapTokenService: MapTokenService) {}

  async handleSearch(query: SearchMapDto, req: ExpressRequestDto, res: Response) {
    try {
      let dataToken = await this.handleGetToken();
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataToken);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    return null;
  }

  async handleGetToken() {
    let tokenObject = await this.mapTokenService.findOne({});
    if (!tokenObject) {
      // const oauth = new OAuth({
      //   consumer: { key: process.env.HERE_MAP_ACCESS_KEY, secret: process.env.HERE_MAP_ACCESS_SECRET },
      //   signature_method: "HMAC-SHA1",
      //   hash_function(base_string, key) {
      //     return crypto.createHmac("sha1", key).update(base_string).digest("base64");
      //   },
      // });
      // const token = {};
      // const request = {
      //   url: "http://worms.pro/uapi/forum/posts?id=65285",
      //   method: "GET"
      //   // data: { id: 65285 },
      // };
      // // console.log(oauth.authorize(request, token))
      // // console.log(oauth.toHeader(oauth.authorize(request, token)))

      // // axios.get('https://api.github.com/users/mapbox')
      // //   .then((response) => {
      // //     console.log(response)
      // //   });

      // let config = {
      //   // url: request.url,
      //   // method: request.method,
      //   headers: oauth.toHeader(oauth.authorize(request, token))
      // };
      // console.log(config);

      // axios
      //   .post("http://worms.pro/uapi/forum/posts", config)
      //   .then(function (response) {
      //     console.log(response);
      //   })
      //   .catch(function (error) {
      //     console.log(error);
      //   });

      // //Process Token Object
      // const oauth = new OAuth({
      //   consumer: { key: process.env.HERE_MAP_ACCESS_KEY, secret: process.env.HERE_MAP_ACCESS_SECRET },
      //   signature_method: "HMAC-SHA1",
      //   hash_function(base_string, key) {
      //     return crypto.createHmac("sha1", key).update(base_string).digest("base64");
      //   },
      // });

      // const dataRequest = {
      //   grant_type: "client_credentials",
      // };
      // const params = new URLSearchParams(dataRequest);
      // const authorization = oauth.authorize(
      //   {
      //     url: process.env.HERE_MAP_URL_GET_TOKEN,
      //     method: "POST",
      //     data: params,
      //   }
      // );

      // let authHeader = oauth.toHeader(authorization);
      // console.log(authHeader);
      // let config = {
      //   method: "POST",
      //   url: process.env.HERE_MAP_URL_GET_TOKEN,
      //   headers: {
      //     Authorization: authHeader.Authorization,
      //     "Content-Type": "application/x-www-form-urlencoded",
      //   },
      //   data: params,
      // };

      // let dataToken = await axios(config)
      //   .then((response) => {
      //     if (response?.data) {
      //       return response?.data;
      //     } else {
      //       return null;
      //     }
      //   })
      //   .catch((error) => {
      //     return error;
      //     return null;
      //   });
      // console.log(dataToken);
      return null;
    } else {
      return tokenObject;
    }
  }
}
