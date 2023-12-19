import { Request, response, Response } from "express";
import { NotFoundException, Injectable, Logger } from "@nestjs/common";
import { FaceDetectionService } from "../services/face_detection.service";
import { CreateFaceDetectionDto } from "../dto/create-face_detection.dto";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import axios from "axios";
import { ChatMediaService } from "../../../modules/chat_media/services/chat_media.service";
import { UserOptionService } from "../../../modules/user/services/user_option.service";
import { ChatMedia } from "../../../modules/chat_media/schemas/chat_media.schema";
import { User } from "../../../modules/user/schemas/user.schema";
/**
 * @author Tony Vu
 * @class MapHelper
 */
@Injectable()
export class FaceDetectionHelper {
  constructor(
    private readonly faceDetectionService: FaceDetectionService,
    private readonly chatMediaService: ChatMediaService,
    private readonly userOptionService: UserOptionService
  ) {}
  private readonly logger = new Logger("detect_image");

  /**
   *
   * @param res
   * @param req
   */
  async getTotalToday(res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new NotFoundException("User is invalid");
      }
      let dataFilter = {
        is_today: "1",
        user_id: userObject?._id?.toString(),
      };

      let dataCount = await this.faceDetectionService.count(dataFilter);
      let dataReturn = {
        count: Number(dataCount),
        total: Number(process.env.TOTAL_FACE_DETECT),
      };
      res.json(dataReturn);
    } catch (error) {
      console.log(error);
      throw new NotFoundException(error.message);
    }
  }
  /**
   *
   * @param query
   * @param req
   * @param res
   * @returns
   */
  async handleValidateAvatar(query: CreateFaceDetectionDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new NotFoundException("User is invalid");
      }

      let avatarUrl = userObject?.user_avatar;
      let image1Object = await this.chatMediaService.findOne({ media_url: avatarUrl });
      if (!image1Object) {
        throw new NotFoundException("Media not Image");
      }
      let imageCompare = userObject?.user_avatar_thumbnail;

      let image2Object = await this.chatMediaService.findById(query.id_compare?.toString());
      if (image2Object?.media_type !== "image") {
        throw new NotFoundException("Media not Image");
      }

      let dataFilter = {
        is_today: "1",
        user_id: userObject?._id?.toString(),
      };

      let dataCount = await this.faceDetectionService.count(dataFilter);

      if (Number(dataCount) >= Number(process.env.TOTAL_FACE_DETECT)) {
        throw new NotFoundException("Limit process, only " + process.env.TOTAL_FACE_DETECT + " per 24 hours!");
      }

      let mediaObject: string[] = JSON.parse(query.media_ids.toString());

      let dataReturn = await this.handleDetectFromServer(image1Object, image2Object, userObject, mediaObject);
      res.json(dataReturn);
    } catch (error) {
      console.log(error);
      throw new NotFoundException(error.message);
    }
    return null;
  }

  /**
   * @author Tony Vu
   * @param image1Object
   * @param image2Object
   * @param userObject
   * @param mediaObject
   * @returns
   */
  async handleDetectFromServer(
    image1Object: ChatMedia,
    image2Object: ChatMedia,
    userObject: User,
    mediaObject: string[]
  ) {
    let base64SingleFace1: any = "";
    let base64SingleFace2: any = "";
    if (image1Object) {
      let base64SingleFaceObject = await axios.get(image1Object.media_thumbnail.toString(), {
        responseType: "arraybuffer",
      });
      base64SingleFace1 = Buffer.from(base64SingleFaceObject.data).toString("base64");
    }
    if (image2Object) {
      let base64SingleFaceObject = await axios.get(image2Object.media_thumbnail.toString(), {
        responseType: "arraybuffer",
      });
      base64SingleFace2 = Buffer.from(base64SingleFaceObject.data).toString("base64");
    }

    if (!base64SingleFace1 || !base64SingleFace2) {
      throw new NotFoundException("Image not validate");
    }

    let point = 0;
    let dataResponse = null;

    if (process.env.FACE_COMPARE != "whiteg") {
      const apiUrl = process.env.API_URL_DETECT;
      const subscriptionKey = process.env.SUBSCRIBE_KEY_DETECT; //change subscription key
      var optionsFaceCompare = {
        headers: {
          subscriptionkey: subscriptionKey,
          "Content-Type": "application/json",
        },
        rejectUnauthorized: false,
      };
      let dataAxios = {
        encoded_image1: base64SingleFace1,
        encoded_image2: base64SingleFace2,
        compareAllFaces: true,
      };

      dataResponse = await axios
        .post(apiUrl + "verify", dataAxios, optionsFaceCompare)
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          return error;
        });

      if (dataResponse && dataResponse?.matchedFaces) {
        if (dataResponse?.matchedFaces?.length) {
          for (let dataValidate of dataResponse?.matchedFaces) {
            if (Number(dataValidate?.confidence) > point) {
              point = parseFloat(dataValidate?.confidence);
            }
          }
        }
      } else {
        //throw new NotFoundException("Error when Validate");
      }
    } else {
      const apiUrl = process.env.FACE_COMPARE_URL;
      const subscriptionKey = process.env.FACE_COMPARE_KEY; //change subscription key

      var FormData = require("form-data");
      var data = new FormData();
      data.append("secret_compare", subscriptionKey);
      data.append("key_compare", "ABC");
      data.append("image_before", base64SingleFace1);
      data.append("image_compare", base64SingleFace2);

      var config = {
        method: "post",
        url: apiUrl,
        headers: {
          ...data.getHeaders(),
        },
        data: data,
      };

      dataResponse = await axios(config)
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          return error;
        });

      if (dataResponse && dataResponse?.status && Number(dataResponse?.status)) {
        point = 80;
      } else {
        point = 0;
        //throw new NotFoundException("Error when Validate");
      }
    }

    let statusValidate = 0;
    if (point > 70) {
      statusValidate = 1;
    }

    let dataToCreate = {
      id_avatar: image1Object._id.toString(),
      id_compare: image2Object._id.toString(),
      media_ids: mediaObject,
      user_id: userObject?._id.toString(),
      point: point,
      validate_status: statusValidate,
      response: JSON.stringify(dataResponse),
    };
    let dataReturn = await this.faceDetectionService.create(dataToCreate);
    //Update User Option
    if (statusValidate) {
      let dataUpdate = {
        user_id: userObject._id?.toString(),
        validate_status: statusValidate,
      };
      await this.userOptionService.update(dataUpdate);
    } else {
      let dataUpdate = {
        user_id: userObject._id?.toString(),
        validate_status: 0,
      };
      await this.userOptionService.update(dataUpdate);
    }
    return dataReturn;
  }
}
