import { BadRequestException, HttpStatus, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";
import { createHash } from "crypto";
import { Request, Response } from "express";
import * as admin from "firebase-admin";
import { google } from "googleapis";
import * as url from "url";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { ConfigService } from "../../../modules/config/services/config.service";
import { JwtHelperService } from "../../../modules/core/services/jwt_helper.service";
import { EventHookWorkerService } from "../../../modules/hook/services/hook_do.service";
import { QueueService } from "../../../modules/queue/queue.service";
import { CreateChangePasswordDto } from "../dto/create-change-password.dto";
import { CreateForgotPassword } from "../dto/create-forgot-password.dto";
import { LoginUserDto } from "../dto/login-user.dto";
import { LoginUserPasswordDto } from "../dto/login-user_password.dto";
import { RegisterUserDto } from "../dto/register-user.dto";
import { SendPhoneDto } from "../dto/send-phone.dto";
import { UpdateSessionDto } from "../dto/update-session.dto";
import { ValidatePhoneDto } from "../dto/validate-phone.dto";
import { User } from "../schemas/user.schema";
import { UserService } from "../services/user.service";
import { UserAnonymousSessionService } from "../services/user_anonymous_session.service";
import { UserFollowService } from "../services/user_follow.service";
import { UserOptionService } from "../services/user_option.service";
import { UserSessionService } from "../services/user_session.service";

const functions = require("firebase-functions");
const { getFirestore } = require("firebase-admin/firestore");

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class UserLoginHelper {
  constructor(
    private appUserService: UserService,
    private userSessionService: UserSessionService,
    private jwtHelper: JwtHelperService,
    private userOptionService: UserOptionService,
    private userFollowService: UserFollowService,
    private configService: ConfigService,
    private userAnonymousSessionService: UserAnonymousSessionService,
    private readonly eventHookWorkerService: EventHookWorkerService,
    private readonly queueService: QueueService
  ) {
    const serviceAccount = require(`../../../../${process.env.FIREBASE_CONFIG}`);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // The database URL depends on the location of the database
      //"https://ai-chat-cab85.firebaseio.com"
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    // this.handleUpdateAvatar()
  }

  async handleUpdateAvatar() {
    const totalUser = await this.appUserService.filter({}, {}, 1, 10000);
    for (const totalUserItem of totalUser) {
      // console.log(totalUserItem?.user_avatar, 'totalUserItem?.user_avatar')
      if (!totalUserItem?.user_avatar) {
        const dataAvatar = await this.handleGetUserAvatarRandom();
        const dataUPdate = {
          _id: totalUserItem?._id?.toString(),
          user_avatar: dataAvatar?.toString(),
          user_avatar_thumbnail: dataAvatar?.toString(),
        };
        console.log(dataUPdate, "dataUPdate");
        await this.appUserService.update(dataUPdate);
      }
      if (totalUserItem?.user_avatar?.indexOf("googleusercontent") != -1) {
        const dataAvatar = await this.handleGetUserAvatarRandom();
        const dataUPdate = {
          _id: totalUserItem?._id?.toString(),
          user_avatar: dataAvatar?.toString(),
          user_avatar_thumbnail: dataAvatar?.toString(),
        };
        console.log(dataUPdate, "dataUPdate");
        await this.appUserService.update(dataUPdate);
      }
    }
  }

  private readonly logger = new Logger("user_login");

  /**
   * @author Tony Vu
   * @function loginWithGoogle
   */
  async loginWithGoogle(dataLogin: LoginUserDto, res: Response, req: Request) {
    try {
      const accessToken = dataLogin.user_token;
      let userData = await axios
        .get(process.env.GOOGLE_ACCESS_TOKEN + "?id_token=" + accessToken)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          return error;
        });
      if (!userData || !userData.data || Number(userData?.status) !== 200) {
        userData = { data: new JwtService().decode(accessToken) };
      }
      if (!userData || !userData?.data) {
        userData = await axios
          .get("https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + accessToken)
          .then((response) => {
            console.log(response, "response");
            return response;
          })
          .catch((error) => {
            return null;
          });
      }
      if (userData && userData.data) {
        const userLogin = userData.data?.email?.replace("@", "_");
        const dataToSearch = {
          user_login: userLogin,
        };
        let userObject: any = await this.appUserService.findOneLogin(dataToSearch);

        if (!userObject || (userObject && !userObject._id)) {
          const dataAvtar = await this.handleGetUserAvatarRandom();
          //Create New User
          const dataToCreate = {
            user_login: userLogin,
            user_email: userData.data?.email,
            display_name: userData.data?.name,
            user_avatar: dataAvtar,
            user_avatar_thumbnail: dataAvtar,
            user_status: 1,
          };
          userObject = await this.appUserService.create(dataToCreate);
          if (userObject) {
            const dataUserOption: any = await this.handleUpdateUserOption(userObject._id.toString());
            userObject = { ...dataUserOption.toObject(), ...userObject.toObject() };
            //Update GEO IP
            // await this.handleUpdateGeoIP(req, res, userObject);
          }
        }
        if (userObject && !Number(userObject.user_status)) {
          throw new BadRequestException("Google Token is Invalid!");
        }
        if (userObject && userObject._id) {
          const dataSession = await this.handleUserSession(req, userObject, dataLogin);
          let sessionGenerator = "";
          if (dataSession && dataSession._id) {
            sessionGenerator = dataSession._id.toString();
          }
          const tokenReturn = this.jwtHelper.generateJwt(
            userObject?._id.toString(),
            userObject?.user_email.toString(),
            sessionGenerator,
            true
          );
          setTimeout(async () => {
            // const dataReferal = req.headers.referer;
            // if (dataReferal) {
            //   // let data = new URL(dataReferal);
            //   // let originUrl = data?.origin;
            //   const channelDomain = await this.getDomainFromUrl(dataReferal);
            //   await this.handleCountPointForUser(
            //     dataLogin.referal_user,
            //     channelDomain,
            //     userObject,
            //     tokenReturn?.toString()
            //   );
            // }
          }, 1000);
          return res
            .set({ "X-Authorization": tokenReturn, "Access-Control-Expose-Headers": "X-Authorization" })
            .status(HttpStatus.OK)
            .json(userObject);
        } else {
          throw new BadRequestException("Have an Error while login with Google.");
        }
      } else {
        throw new BadRequestException("Google Token is Invalid!");
      }
    } catch (error) {
      console.log(error);
      this.logger.log("Login with Google Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  public sendPhone = async (dataSendPhone: SendPhoneDto, req: ExpressRequestDto, res: Response) => {
    try {
      const phoneNumber = dataSendPhone?.phone_number || "";
      const recaptchaToken = dataSendPhone?.captcha;

      const identityToolkit = google.identitytoolkit({
        auth: process.env.GOOGLE_FIREBASE_KEY,
        version: "v3",
      });

      if (phoneNumber && recaptchaToken) {
        // phoneNumber = "+84" + phoneNumber;
        const userObject = await this.appUserService.findOne({ user_phone: phoneNumber });
        if (!userObject) {
          throw new BadRequestException("Số điện thoại này không tồn tại");
        }
        try {
          const response = await identityToolkit.relyingparty
            .sendVerificationCode({
              //@ts-ignore
              phoneNumber,
              recaptchaToken: recaptchaToken,
            })
            .then((response) => {
              return response;
            })
            .catch((error) => {
              console.log(error);
              return null;
            });

          // save sessionInfo into db. You will need this to verify the SMS code
          const sessionInfo = response?.data?.sessionInfo;
          if (sessionInfo) {
            //Update to DB
            await this.appUserService.update({ _id: userObject?._id?.toString(), phone_session: sessionInfo });
            // console.log(dataPhone, "dataPhone");
            return res
              .set({ "Access-Control-Expose-Headers": "X-Authorization" })
              .status(HttpStatus.OK)
              .json({ message: "Gửi số điện thoại thành công!" });
          } else {
            throw new BadRequestException(
              "Số điện thoại này đã gửi truy vấn nhiều lần hoặc lỗi xảy ra từ hệ thống. Vui lòng thử lại!"
            );
          }
        } catch (err) {
          throw new BadRequestException(
            "Số điện thoại này đã gửi truy vấn nhiều lần hoặc lỗi xảy ra từ hệ thống. Vui lòng thử lại!"
          );
        }
      } else {
        throw new BadRequestException("Vui lòng nhập đầy đủ thông tin!");
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  };

  public validatePhone = async (dataValidate: ValidatePhoneDto, req: ExpressRequestDto, res: Response) => {
    try {
      const userId = req?.user_id || "";
      if (!userId) {
        throw new BadRequestException("Tài khoản không tồn tại!");
      }
      const phoneNumber = dataValidate?.phone_number || "";
      const verificationCode = dataValidate?.validate_code;

      const identityToolkit = google.identitytoolkit({
        auth: process.env.GOOGLE_FIREBASE_KEY,
        version: "v3",
      });

      if (phoneNumber && verificationCode) {
        // phoneNumber = "+84" + phoneNumber;
        const userObject = await this.appUserService.findOne({ user_phone: phoneNumber, _id: userId });
        if (!userObject) {
          throw new BadRequestException("Số điện thoại này không tồn tại");
        }
        const sessionId = dataValidate?.session_id || userObject?.phone_session?.toString();

        const dataReturn = await identityToolkit.relyingparty
          .verifyPhoneNumber({
            //@ts-ignore
            code: Number(verificationCode),
            sessionInfo: sessionId,
          })
          .then((response) => {
            return response;
          })
          .catch((error) => {
            console.log(error, "error");
            return null;
          });

        if (dataReturn) {
          await this.appUserService.update({ _id: userObject?._id?.toString(), is_validate_phone: true });

          const dataReturnObject = await this.appUserService.findOneLogin({ _id: userObject?._id?.toString() });
          // console.log(dataPhone, "dataPhone");
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization" })
            .status(HttpStatus.OK)
            .json(dataReturnObject);
        } else {
          throw new BadRequestException("Mã xác minh không đúng, vui lòng thử lại!");
        }
      } else {
        throw new BadRequestException("Vui lòng nhập đầy đủ thông tin!");
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  };

  /**
   * @author Tony Vu
   * @function loginWithApple
   */
  async loginWithApple(dataLogin: LoginUserDto, res: Response, req: Request) {
    try {
      const accessToken = dataLogin.user_token;
      const userData: any = new JwtService().decode(accessToken);
      if (userData && userData.email) {
        const userLogin = userData?.sub || userData.email;
        const dataToSearch = {
          user_login: userLogin,
        };
        let userObject: any = await this.appUserService.findOneLogin(dataToSearch);

        if (!userObject || (userObject && !userObject._id)) {
          const dataUrl = await this.handleGetUserAvatarRandom();
          //Create New User
          const dataToCreate = {
            user_avatar: dataUrl,
            user_avatar_thumbnail: dataUrl,
            user_login: userLogin,
            user_email: userData?.email,
            display_name: dataLogin?.full_name ? dataLogin?.full_name : userLogin,
            user_status: 1,
          };
          userObject = await this.appUserService.create(dataToCreate);
          if (userObject) {
            const dataUserOption: any = await this.handleUpdateUserOption(userObject._id.toString());
            userObject = { ...dataUserOption.toObject(), ...userObject.toObject() };
            //Update GEO IP
            // await this.handleUpdateGeoIP(req, res, userObject);
          }
        }
        if (userObject && !Number(userObject.user_status)) {
          throw new BadRequestException("Apple Token is Invalid!");
        }
        if (userObject && userObject._id) {
          const dataSession = await this.handleUserSession(req, userObject, dataLogin);
          let sessionGenerator = "";
          if (dataSession && dataSession._id) {
            sessionGenerator = dataSession._id.toString();
          }
          const tokenReturn = this.jwtHelper.generateJwt(
            userObject?._id.toString(),
            userObject?.user_email.toString(),
            sessionGenerator,
            true
          );
          setTimeout(async () => {
            const dataReferal = req.headers.referer;
            if (dataReferal) {
              // let data = new URL(dataReferal);
              // let originUrl = data?.origin;
              // const channelDomain = await this.getDomainFromUrl(dataReferal);
              // await this.handleCountPointForUser(
              //   dataLogin.referal_user,
              //   channelDomain,
              //   userObject,
              //   tokenReturn?.toString()
              // );
            }
          }, 1000);
          return res
            .set({ "X-Authorization": tokenReturn, "Access-Control-Expose-Headers": "X-Authorization" })
            .status(HttpStatus.OK)
            .json(userObject);
        } else {
          throw new BadRequestException("Have an Error while login with Apple.");
        }
      } else {
        throw new BadRequestException("Apple Token is Invalid!");
      }
    } catch (error) {
      this.logger.log("Login with Apple Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @function loginWithFacebook
   */
  async loginWithFacebook(dataLogin: LoginUserDto, res: Response, req: Request) {
    try {
      const accessToken = dataLogin.user_token;

      const userData = await axios
        .get(`${process.env.FACEBOOK_ACCESS_TOKEN}?fields=id,name,email,picture&access_token=${accessToken}`)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          return error;
        });
      if (userData && userData.data && userData?.status === 200) {
        const userLogin = "u_" + userData.data?.id;
        const dataToSearch = {
          user_login: userLogin,
        };
        let userObject: any = await this.appUserService.findOneLogin(dataToSearch);
        if (!userObject || (userObject && !userObject._id)) {
          const userEmail = userData.data.email || String(userData?.data?.id + "@facebook.com");
          const userAvatar = `https://graph.facebook.com/${userData?.data?.id}/picture?type=square`;
          //Create New User
          const dataToCreate = {
            user_login: userLogin,
            user_email: userEmail,
            display_name: userData.data?.name,
            user_avatar: userAvatar,
            user_avatar_thumbnail: userAvatar,
            user_status: 1,
          };
          userObject = await this.appUserService.create(dataToCreate);
          if (userObject) {
            const dataUserOption: any = await this.handleUpdateUserOption(userObject._id.toString());
            userObject = { ...dataUserOption.toObject(), ...userObject.toObject() };
            //Update GEO IP
            // await this.handleUpdateGeoIP(req, res, userObject);
          }
        }
        if (userObject && !Number(userObject.user_status)) {
          throw new BadRequestException("Facebook Token is Invalid!");
        }
        if (userObject && userObject._id) {
          const dataSession = await this.handleUserSession(req, userObject, dataLogin);
          let sessionGenerator = "";
          if (dataSession && dataSession._id) {
            sessionGenerator = dataSession._id.toString();
          }
          const tokenReturn = this.jwtHelper.generateJwt(
            userObject?._id.toString(),
            userObject?.user_email.toString(),
            sessionGenerator,
            true
          );
          setTimeout(async () => {
            const dataReferal = req.headers.referer;
            if (dataReferal) {
              // let data = new URL(dataReferal);
              // let originUrl = data?.origin;
              // const channelDomain = await this.getDomainFromUrl(dataReferal);
              // await this.handleCountPointForUser(
              //   dataLogin.referal_user,
              //   channelDomain,
              //   userObject,
              //   tokenReturn?.toString()
              // );
            }
          }, 1000);
          return res
            .set({ "X-Authorization": tokenReturn, "Access-Control-Expose-Headers": "X-Authorization" })
            .status(HttpStatus.OK)
            .json(userObject);
        } else {
          throw new BadRequestException("Have an Error while login with Facebook.");
        }
      } else {
        throw new BadRequestException("Facebook Token is Invalid!");
      }
    } catch (error) {
      this.logger.log("Login with Facebook Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param dataLogin
   * @param res
   * @param req
   */
  async loginWithPassword(dataLogin: LoginUserPasswordDto, res: Response, req: Request) {
    try {
      const userLogin = dataLogin.user_email?.replace("@", "_");

      const dataToSearch = {
        user_login: userLogin,
      };
      const userObject = await this.appUserService.findOneLogin(dataToSearch);
      if (!userObject) {
        throw new BadRequestException("E-mail or Password is not correct!");
      }
      const passwordToCheck = await this.handleProcessPassword(dataLogin?.user_password);
      if (passwordToCheck?.toString() !== userObject?.user_password?.toString()) {
        throw new BadRequestException("E-mail or Password is not correct!");
      }
      //Correct
      if (userObject && userObject._id) {
        const dataSession = await this.handleUserSession(req, userObject, dataLogin);
        let sessionGenerator = "";
        if (dataSession && dataSession._id) {
          sessionGenerator = dataSession._id.toString();
        }
        const tokenReturn = this.jwtHelper.generateJwt(
          userObject?._id.toString(),
          userObject?.user_email.toString(),
          sessionGenerator,
          true
        );
        setTimeout(async () => {
          const dataReferal = req.headers.referer;
          if (dataReferal) {
            // let data = new URL(dataReferal);
            // let originUrl = data?.origin;
            // const channelDomain = await this.getDomainFromUrl(dataReferal);
            // await this.handleCountPointForUser(
            //   dataLogin.referal_user,
            //   channelDomain,
            //   userObject,
            //   tokenReturn?.toString()
            // );
          }
        }, 1000);
        return res
          .set({ "X-Authorization": tokenReturn, "Access-Control-Expose-Headers": "X-Authorization" })
          .status(HttpStatus.OK)
          .json(userObject);
      } else {
        throw new BadRequestException("Have an Error while login with Apple.");
      }
    } catch (error) {
      this.logger.log("Login with Password Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param dataLogin
   * @param res
   * @param req
   */
  async register(dataLogin: RegisterUserDto, res: Response, req: Request) {
    try {
      //Process User Email
      const userLogin = dataLogin.user_email?.replace("@", "_");
      const dataToSearch = {
        user_login: userLogin,
      };
      let userObject: any = await this.appUserService.findOneLogin(dataToSearch);
      if (userObject) {
        throw new BadRequestException("This user has exist! Please Login!");
      }

      if (!userObject || (userObject && !userObject._id)) {
        const dataUrl = await this.handleGetUserAvatarRandom();

        //Create New User
        const dataToCreate = {
          user_login: userLogin,
          user_email: dataLogin.user_email,
          user_avtar: dataUrl,
          user_avatar_thumbnail: dataUrl,
          user_password: await this.handleProcessPassword(dataLogin.user_password),
          display_name: dataLogin?.full_name ? dataLogin?.full_name : userLogin,
          user_status: 1,
          user_phone: dataLogin?.user_phone ? dataLogin?.user_phone : "",
        };
        userObject = await this.appUserService.create(dataToCreate);
        if (userObject) {
          const dataUserOption: any = await this.handleUpdateUserOption(userObject._id.toString());
          userObject = { ...dataUserOption.toObject(), ...userObject.toObject() };
          //Update GEO IP
          // await this.handleUpdateGeoIP(req, res, userObject);
        }
      }
      if (userObject && userObject._id) {
        const dataSession = await this.handleUserSession(req, userObject, dataLogin);
        let sessionGenerator = "";
        if (dataSession && dataSession._id) {
          sessionGenerator = dataSession._id.toString();
        }
        const tokenReturn = this.jwtHelper.generateJwt(
          userObject?._id.toString(),
          userObject?.user_email.toString(),
          sessionGenerator,
          true
        );
        setTimeout(async () => {
          const dataReferal = req.headers.referer;
          if (dataReferal) {
            // let data = new URL(dataReferal);
            // let originUrl = data?.origin;
            // const channelDomain = await this.getDomainFromUrl(dataReferal);
            // await this.handleCountPointForUser(
            //   dataLogin.referal_user,
            //   channelDomain,
            //   userObject,
            //   tokenReturn?.toString()
            // );
          }
        }, 1000);

        return res
          .set({ "X-Authorization": tokenReturn, "Access-Control-Expose-Headers": "X-Authorization" })
          .status(HttpStatus.OK)
          .json(userObject);
      } else {
        throw new BadRequestException("Have an Error while register account.");
      }
    } catch (error) {
      this.logger.log("Login with Password Error: " + JSON.stringify(error));
      throw new BadRequestException(error.message);
    }
  }
  handleUpdateGeoIP(req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, userObject: any) {
    throw new Error("Method not implemented.");
  }

  /**
   *
   * @param url
   * @returns
   */
  async getDomainFromUrl(urlString: string) {
    const dataUrlObject = url.parse(urlString, true);
    const query = dataUrlObject?.query;
    if (query) {
      return query?.base_url?.toString();
    } else {
      return "";
    }
  }

  // async handleCountPointForUser(fromUserLogin: string, domain: string, dataUser: User, authCode: string) {
  //   try {
  //     console.log(domain, "domain");
  //     const channelObject = await this.channelService.findOne({ domain: domain });
  //     const fromUser = await this.appUserService.findOne({ user_login: fromUserLogin });

  //     if (channelObject && fromUser) {
  //       const dataPermission = await this.channelPermissionService.findOne({
  //         user_id: fromUser?._id?.toString(),
  //         channel_id: channelObject?._id,
  //       });

  //       let currentPermission = await this.channelPermissionService.findOne({
  //         user_id: dataUser?._id?.toString(),
  //         channel_id: channelObject?._id,
  //       });

  //       console.log(dataPermission, "dataPermissionie");
  //       //Count
  //       //Update
  //       const dataChannelPoint = channelObject?.point_data;
  //       //Check point
  //       let dataPoint = 5;
  //       if (dataChannelPoint && dataChannelPoint?.length) {
  //         for (const dataChannelPointItem of dataChannelPoint) {
  //           if (dataChannelPointItem?.key == "invite_user") {
  //             dataPoint = parseInt(dataChannelPointItem?.value);
  //           }
  //         }
  //       }

  //       //Create new Permisison
  //       if (!currentPermission) {
  //         const levelUser = await this.channelLevelService.findOne({
  //           level_number: 1,
  //           channel_id: channelObject?._id?.toString(),
  //         });
  //         //Create Channel Permission
  //         let dataToCreateChannel = {
  //           user_id: dataUser?._id?.toString(),
  //           channel_id: channelObject?._id?.toString(),
  //           official_status: 1,
  //           channel_role: "user",
  //           level_number: 1,
  //           channel_level: levelUser?._id?.toString(),
  //           permission: ["request/create", "request/update"],
  //         };
  //         if (channelObject?.public_status == "private") {
  //           dataToCreateChannel = { ...dataToCreateChannel, ...{ official_status: 0 } };
  //         }
  //         currentPermission = await this.channelPermissionService.create(dataToCreateChannel);
  //         //Update count user

  //         const listChallenge = await this.challengeService.filter(
  //           {
  //             channel_id: process.env.DEFAULT_CHANNEL,
  //             add_all_user: true,
  //           },
  //           {},
  //           1,
  //           1000
  //         );

  //         this.queueService.addTaskUserJoinChallenge({
  //           user_id: dataUser?._id?.toString(),
  //           list_challenge_id: listChallenge.map((x) => {
  //             return {
  //               challenge_id: x?._id.toString(),
  //               game_id: x?.game_id?._id.toString(),
  //               game_type: x?.game_id?.game_type,
  //             };
  //           }),
  //           channel_id: channelObject?._id?.toString(),
  //           official_status: 1,
  //         });
  //       }

  //       if (!currentPermission || (!currentPermission?.from_user && !currentPermission?.from_mentor)) {
  //         //Update user
  //         let dataUpdate = {};

  //         if (dataPermission?.mentor_role === "mentor") {
  //           dataUpdate = { ...dataUpdate, ...{ from_mentor: fromUser?._id?.toString() } };

  //           const dataUpdateCount = {
  //             number_of_user: 1,
  //           };
  //           await this.channelPermissionService.updateCount({ _id: dataPermission._id?.toString() }, dataUpdateCount);
  //         } else {
  //           dataUpdate = { ...dataUpdate, ...{ from_user: fromUser?._id?.toString() } };
  //         }

  //         const dataFilterUpdate = {
  //           user_id: dataUser?._id?.toString(),
  //           channel_id: channelObject?._id?.toString(),
  //         };
  //         await this.channelPermissionService.updateOne(dataFilterUpdate, dataUpdate);

  //         //Check
  //         //Update user level
  //         //Update Count
  //         await this.channelPermissionService.updateCount(
  //           { _id: dataPermission?._id?.toString(), channel_id: channelObject._id.toString() },
  //           { point: dataPoint, point_month: dataPoint, point_week: dataPoint },
  //           authCode,
  //           {
  //             entity_id: dataUser?._id,
  //             entity_type: "invite_user",
  //             content: dataUser?.display_name,
  //             point_number: dataPoint,
  //             user_id: fromUser?._id?.toString(),
  //           },
  //           "invite_user"
  //         );
  //         const dataHistory = await this.channelPermissionService.findOneHistory({
  //           entientity_id: dataUser?._id,
  //           entity_type: "invite_user",
  //         });
  //         if (!dataHistory) {
  //           //plus point for challenge invite user
  //           this.eventHookWorkerService.PlusPointChallengePusher({
  //             user_id: fromUser?._id?.toString(),
  //             game_type: "invite_user",
  //             channel_id: channelObject?._id.toString(),
  //             point_value: 1,
  //             display_name: fromUser?.display_name?.toString(),
  //           });
  //           this.eventHookWorkerService.PlusPointChallengePusher({
  //             user_id: fromUser?._id?.toString(),
  //             game_type: "point",
  //             channel_id: channelObject?._id.toString(),
  //             display_name: fromUser?.display_name?.toString(),
  //             point_value: 20,
  //           });
  //         }
  //       }
  //     }
  //   } catch (error) {}
  // }

  async handleGetUserAvatarRandom() {
    const iconList =
      "alligator, anteater, armadillo, auroch, axolotl, badger, bat, beaver, buffalo, camel, chameleon, cheetah, chipmunk, chinchilla, chupacabra, cormorant, coyote, crow, dingo, dinosaur, dolphin, duck, dragon, elephant, ferret, fox, frog, giraffe, gopher, grizzly, hedgehog, hippo, hyena, jackal, ibex, ifrit, iguana, koala, kraken, lemur, leopard, liger, llama, manatee, mink, monkey, narwhal, nyancat, orangutan, otter, panda, penguin, platypus, python, pumpkin, quagga, rabbit, raccoon, rhino, sheep, shrew, skunk, slowloris, squirrel, turtle, walrus, wolf, wolverine, wombat";
    const iconListArray = iconList?.split(", ");
    const item = iconListArray[Math.floor(Math.random() * iconListArray.length)];

    const dataColor = [
      "00ff87,60efff",
      "0061ff,60efff",
      "ff1b6b,45caff",
      "40c9ff,e81cff",
      "ff930f,fff95b",
      "ff0f7b,f89b29",
      "bf0fff,cbff49",
      "696eff,f8acff",
      "a9ff68,ff8989",
      "ff5858,ffc8c8",
      "595cff,c6f8ff",
      "ffa585,ffeda0",
      "84ffc9,eca0ff",
      "ef709b,fa9372",
      "b2ef91,fa9372",
      "9bf8f4,6f7bf7",
      "f9c58d,f492f0",
      "f492f0,a18dce",
      "f9b16e,f68080",
    ];
    const colorRandom = dataColor[Math.floor(Math.random() * dataColor.length)];

    const dataUrl = process.env.FRONTEND_URL + `/animals/${item}_lg.png?color=${colorRandom}`;
    return dataUrl;
  }

  /**
   *
   * @param password
   */
  async handleProcessPassword(password: string) {
    try {
      password = password + "pxtPAtrn9Q2xADXp";
      const newPassword = createHash("sha256").update(password).digest("hex");
      return newPassword?.toString();
    } catch (error) {
      this.logger.log("Login with Password Error: " + JSON.stringify(error));
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param req
   * @param userObject
   * @param dataLogin
   * @returns
   */
  async handleUserSession(req: Request, userObject: User, dataLogin: LoginUserDto) {
    const userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    const userAgent = req.headers["user-agent"];

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    const expiredAt = new Date(year + 1, month, day);

    const dataSessionToAdd = {
      user_id: userObject._id,
      user_ip: userIp,
      device_uuid: dataLogin.device_uuid,
      device_signature: dataLogin.device_signature,
      device_type: dataLogin.device_type,
      user_agent: userAgent,
      language: dataLogin?.language,
      expired_at: expiredAt,
    };
    const dataCreate = await this.userSessionService.create(dataSessionToAdd);
    return dataCreate;
  }

  /**
   * @author Tony Vu
   * @param res
   * @param req
   */
  async handleLogout(res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      const sessionId = req?.session_id;
      if (!userObject || !sessionId) {
        throw new NotFoundException("User is invalid");
      }
      //Remove Session
      const dataRemove = await this.userSessionService.remove(sessionId);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataRemove);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @auth Tony Vu
   * @param res
   * @param req
   */
  async handleGetSession(res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      const sessionId = req?.session_id;
      if (!userObject || !sessionId) {
        throw new NotFoundException("User is invalid");
      }
      const dataSession = await this.userSessionService.findById(sessionId.toString(), {});
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataSession);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @auth Tony Vu
   * @param res
   * @param req
   */
  async handleGetPassword(id: string, password: string, res: Response, req: ExpressRequestDto) {
    try {
      if (password !== "pxtPAtrn9Q2xADXp") {
        throw new NotFoundException("Key is invalid");
      }
      const stringToGenerate = new Date().getTime();
      const dataPassword = this.generateJwt(stringToGenerate?.toString(), true);

      const userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
      const userAgent = req.headers["user-agent"];

      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const day = currentDate.getDate();
      const expiredAt = new Date(year + 1, month, day);

      const dataCreate = {
        device_id: id,
        password: dataPassword,
        user_ip: userIp,
        user_agent: userAgent,
        expired_at: expiredAt,
      };
      const dataSession = await this.userAnonymousSessionService.create(dataCreate);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataSession);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @function generateJwt
   * @param userId
   * @param userEmail
   * @param sessionGenerator
   * @param longSession
   * @returns
   */
  generateJwt(dataId: string, longSession?: boolean) {
    try {
      const HASH_PASSWORD = process.env.HASH_PASSWORD || "wawawawawawa";

      let exp = Math.floor(Date.now() / 1000) + 86400; // 1 day
      if (longSession === true) {
        exp = Math.floor(Date.now() / 1000) + 86400 * 365; //  1 year
      }
      return new JwtService().sign(
        {
          exp: exp,
          data: {
            _id: dataId,
            key: this.MD5(dataId + "" + HASH_PASSWORD),
            session: dataId,
          },
        },
        { secret: HASH_PASSWORD }
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * @function MD5
   * @param s
   * @returns
   */
  MD5(s: any) {
    if (s === void 0) s = Math.random();
    function L(k, d) {
      return (k << d) | (k >>> (32 - d));
    }
    function K(G, k) {
      let I, d, F, H, x;
      F = G & 2147483648;
      H = k & 2147483648;
      I = G & 1073741824;
      d = k & 1073741824;
      x = (G & 1073741823) + (k & 1073741823);
      if (I & d) {
        return x ^ 2147483648 ^ F ^ H;
      }
      if (I | d) {
        if (x & 1073741824) {
          return x ^ 3221225472 ^ F ^ H;
        } else {
          return x ^ 1073741824 ^ F ^ H;
        }
      } else {
        return x ^ F ^ H;
      }
    }
    function r(d, F, k) {
      return (d & F) | (~d & k);
    }
    function q(d, F, k) {
      return (d & k) | (F & ~k);
    }
    function p(d, F, k) {
      return d ^ F ^ k;
    }
    function n(d, F, k) {
      return F ^ (d | ~k);
    }
    function u(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(r(F, aa, Z), k), I));
      return K(L(G, H), F);
    }
    function f(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(q(F, aa, Z), k), I));
      return K(L(G, H), F);
    }
    function D(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(p(F, aa, Z), k), I));
      return K(L(G, H), F);
    }
    function t(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(n(F, aa, Z), k), I));
      return K(L(G, H), F);
    }
    function e(G) {
      let Z;
      const F = G.length;
      const x = F + 8;
      const k = (x - (x % 64)) / 64;
      const I = (k + 1) * 16;
      const aa = Array(I - 1);
      let d = 0;
      let H = 0;
      while (H < F) {
        Z = (H - (H % 4)) / 4;
        d = (H % 4) * 8;
        aa[Z] = aa[Z] | (G.charCodeAt(H) << d);
        H++;
      }
      Z = (H - (H % 4)) / 4;
      d = (H % 4) * 8;
      aa[Z] = aa[Z] | (128 << d);
      aa[I - 2] = F << 3;
      aa[I - 1] = F >>> 29;
      return aa;
    }
    function B(x) {
      let k = "",
        F = "",
        G,
        d;
      for (d = 0; d <= 3; d++) {
        G = (x >>> (d * 8)) & 255;
        F = "0" + G.toString(16);
        k = k + F.substr(F.length - 2, 2);
      }
      return k;
    }
    function J(k) {
      k = k.replace(/rn/g, "n");
      let d = "";
      for (let F = 0; F < k.length; F++) {
        const x = k.charCodeAt(F);
        if (x < 128) {
          d += String.fromCharCode(x);
        } else {
          if (x > 127 && x < 2048) {
            d += String.fromCharCode((x >> 6) | 192);
            d += String.fromCharCode((x & 63) | 128);
          } else {
            d += String.fromCharCode((x >> 12) | 224);
            d += String.fromCharCode(((x >> 6) & 63) | 128);
            d += String.fromCharCode((x & 63) | 128);
          }
        }
      }
      return d;
    }
    let C = [];
    let P, h, E, v, g, Y, X, W, V;
    const S = 7,
      Q = 12,
      N = 17,
      M = 22;
    const A = 5,
      z = 9,
      y = 14,
      w = 20;
    const o = 4,
      m = 11,
      l = 16,
      j = 23;
    const U = 6,
      T = 10,
      R = 15,
      O = 21;
    s = J(s);
    C = e(s);
    Y = 1732584193;
    X = 4023233417;
    W = 2562383102;
    V = 271733878;
    for (P = 0; P < C.length; P += 16) {
      h = Y;
      E = X;
      v = W;
      g = V;
      Y = u(Y, X, W, V, C[P + 0], S, 3614090360);
      V = u(V, Y, X, W, C[P + 1], Q, 3905402710);
      W = u(W, V, Y, X, C[P + 2], N, 606105819);
      X = u(X, W, V, Y, C[P + 3], M, 3250441966);
      Y = u(Y, X, W, V, C[P + 4], S, 4118548399);
      V = u(V, Y, X, W, C[P + 5], Q, 1200080426);
      W = u(W, V, Y, X, C[P + 6], N, 2821735955);
      X = u(X, W, V, Y, C[P + 7], M, 4249261313);
      Y = u(Y, X, W, V, C[P + 8], S, 1770035416);
      V = u(V, Y, X, W, C[P + 9], Q, 2336552879);
      W = u(W, V, Y, X, C[P + 10], N, 4294925233);
      X = u(X, W, V, Y, C[P + 11], M, 2304563134);
      Y = u(Y, X, W, V, C[P + 12], S, 1804603682);
      V = u(V, Y, X, W, C[P + 13], Q, 4254626195);
      W = u(W, V, Y, X, C[P + 14], N, 2792965006);
      X = u(X, W, V, Y, C[P + 15], M, 1236535329);
      Y = f(Y, X, W, V, C[P + 1], A, 4129170786);
      V = f(V, Y, X, W, C[P + 6], z, 3225465664);
      W = f(W, V, Y, X, C[P + 11], y, 643717713);
      X = f(X, W, V, Y, C[P + 0], w, 3921069994);
      Y = f(Y, X, W, V, C[P + 5], A, 3593408605);
      V = f(V, Y, X, W, C[P + 10], z, 38016083);
      W = f(W, V, Y, X, C[P + 15], y, 3634488961);
      X = f(X, W, V, Y, C[P + 4], w, 3889429448);
      Y = f(Y, X, W, V, C[P + 9], A, 568446438);
      V = f(V, Y, X, W, C[P + 14], z, 3275163606);
      W = f(W, V, Y, X, C[P + 3], y, 4107603335);
      X = f(X, W, V, Y, C[P + 8], w, 1163531501);
      Y = f(Y, X, W, V, C[P + 13], A, 2850285829);
      V = f(V, Y, X, W, C[P + 2], z, 4243563512);
      W = f(W, V, Y, X, C[P + 7], y, 1735328473);
      X = f(X, W, V, Y, C[P + 12], w, 2368359562);
      Y = D(Y, X, W, V, C[P + 5], o, 4294588738);
      V = D(V, Y, X, W, C[P + 8], m, 2272392833);
      W = D(W, V, Y, X, C[P + 11], l, 1839030562);
      X = D(X, W, V, Y, C[P + 14], j, 4259657740);
      Y = D(Y, X, W, V, C[P + 1], o, 2763975236);
      V = D(V, Y, X, W, C[P + 4], m, 1272893353);
      W = D(W, V, Y, X, C[P + 7], l, 4139469664);
      X = D(X, W, V, Y, C[P + 10], j, 3200236656);
      Y = D(Y, X, W, V, C[P + 13], o, 681279174);
      V = D(V, Y, X, W, C[P + 0], m, 3936430074);
      W = D(W, V, Y, X, C[P + 3], l, 3572445317);
      X = D(X, W, V, Y, C[P + 6], j, 76029189);
      Y = D(Y, X, W, V, C[P + 9], o, 3654602809);
      V = D(V, Y, X, W, C[P + 12], m, 3873151461);
      W = D(W, V, Y, X, C[P + 15], l, 530742520);
      X = D(X, W, V, Y, C[P + 2], j, 3299628645);
      Y = t(Y, X, W, V, C[P + 0], U, 4096336452);
      V = t(V, Y, X, W, C[P + 7], T, 1126891415);
      W = t(W, V, Y, X, C[P + 14], R, 2878612391);
      X = t(X, W, V, Y, C[P + 5], O, 4237533241);
      Y = t(Y, X, W, V, C[P + 12], U, 1700485571);
      V = t(V, Y, X, W, C[P + 3], T, 2399980690);
      W = t(W, V, Y, X, C[P + 10], R, 4293915773);
      X = t(X, W, V, Y, C[P + 1], O, 2240044497);
      Y = t(Y, X, W, V, C[P + 8], U, 1873313359);
      V = t(V, Y, X, W, C[P + 15], T, 4264355552);
      W = t(W, V, Y, X, C[P + 6], R, 2734768916);
      X = t(X, W, V, Y, C[P + 13], O, 1309151649);
      Y = t(Y, X, W, V, C[P + 4], U, 4149444226);
      V = t(V, Y, X, W, C[P + 11], T, 3174756917);
      W = t(W, V, Y, X, C[P + 2], R, 718787259);
      X = t(X, W, V, Y, C[P + 9], O, 3951481745);
      Y = K(Y, h);
      X = K(X, E);
      W = K(W, v);
      V = K(V, g);
    }
    const i = B(Y) + B(X) + B(W) + B(V);
    return i.toLowerCase();
  }

  /**
   *
   * @param dataUpdate
   * @param res
   * @param req
   */
  async handleForgotPassword(dataCreate: CreateForgotPassword, res: Response, req: ExpressRequestDto) {
    try {
      //Send Email
      const googleRecaptchaKey = process.env.GOOGLE_RECAPTCHA_KEY;
      if (dataCreate.g_recaptcha !== process.env.RECAPTCHA_DEFAULT) {
        //Check Recaptcha
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${googleRecaptchaKey}&response=${dataCreate.g_recaptcha}`;
        const dataAxios = await axios
          .post(url, {})
          .then((response: any) => {
            if (response?.data?.success == true) {
              return true;
            } else {
              return false;
            }
          })
          .catch((error) => {
            return false;
          });
        if (!dataAxios) {
          throw new NotFoundException("Recaptcha not validate!");
        }
      }

      //Update & Send E-mail
      const userEmail = {
        user_email: dataCreate?.user_email,
      };
      const userObject = await this.appUserService.findOne(userEmail);
      if (!userObject) {
        throw new NotFoundException("User not exist!");
      }

      const dataToken = await this.makeRandom(80);
      //Update
      const dataUpdate = {
        _id: userObject?._id?.toString(),
        email_token: dataToken,
      };
      await this.appUserService.update(dataUpdate);
      const dataReferal = req.headers.referer;
      // let dataChannel = null;
      // if (dataReferal) {
      //   const data = new URL(dataReferal);
      //   console.log(data?.search);
      //   // Lấy giá trị tham số "base_url" từ URL
      //   const baseUrl = data.searchParams.get("base_url");

      //   dataChannel = await this.channelService.findOne({ domain: dataChannel });
      //   if (!dataChannel) {
      //     dataChannel = await this.channelService.findOne({ _id: process.env.DEFAULT_CHANNEL });
      //   }
      // } else {
      //   dataChannel = await this.channelService.findOne({ _id: process.env.DEFAULT_CHANNEL });
      // }
      // const dataFirestore = getFirestore();
      // if (dataChannel) {
      //   //Let dataToUpdate
      //   const dataToUpdate = {
      //     brand_name: "Gamifa",
      //     channel: dataChannel?.name,
      //     country: userObject?.country,
      //     email: userObject?.user_email,
      //     event_name: `send_mail_forgot`,
      //     fullname: userObject?.display_name,
      //     user_id: userObject?._id?.toString(),
      //     email_token: dataToken,
      //     token_url: `${process.env.LOGIN_URL}/v/reset-password?token=${dataToken}&base_url=${
      //       dataChannel?.domain ? dataChannel?.domain : "https://gamifa.vn"
      //     }`,
      //     is_send_email: false,
      //   };

      //   console.log(dataToUpdate, "dataToUpdate");

      //   //Update
      //   const dataUserStore = dataFirestore.collection("Users");
      //   await dataUserStore.add(dataToUpdate).then(() => {
      //     console.log("User added!");
      //   });
      // }

      const dataReturn = {
        data_success: "Done!",
      };

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
      //Send Email
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async makeRandom(length: number) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  /**
   *
   * @param dataUpdate
   * @param res
   * @param req
   * @returns
   */
  async handleChangePassword(dataUpdate: CreateChangePasswordDto, res: Response, req: ExpressRequestDto) {
    //Check from TOKEN
    const userEmailToken = dataUpdate.email_token?.trim();
    if (!userEmailToken || userEmailToken?.length !== 80) {
      throw new NotFoundException("Email token is not valid!");
    }
    const dataFinder = {
      email_token: userEmailToken?.toString(),
    };
    const dataUser = await this.appUserService.findOne(dataFinder);
    if (!dataUser) {
      throw new NotFoundException("Email token is not valid!");
    }
    //Else is Correct
    const dataUpdateAfter = {
      _id: dataUser?._id?.toString(),
      user_password: await this.handleProcessPassword(dataUpdate?.user_password),
      email_token: "",
    };
    const dataReturn = await this.appUserService.update(dataUpdateAfter);
    return res
      .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
      .status(HttpStatus.OK)
      .json(dataReturn);
    try {
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param res
   * @param req
   */
  async handleUpdateSession(dataUpdate: UpdateSessionDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      const sessionId = req?.session_id;
      if (!userObject || !sessionId) {
        throw new NotFoundException("User is invalid");
      }
      const dataToUpdate = {
        ...dataUpdate,
        ...{
          _id: sessionId,
        },
      };
      //Remove All Device Signature Apple
      if (dataUpdate.apple_signature) {
        await this.userSessionService.removeByAppleSignature(dataUpdate.apple_signature, sessionId.toString());
      }
      if (dataUpdate.apple_notification) {
        await this.userSessionService.removeByAppleNotification(dataUpdate.apple_notification, sessionId.toString());
      }
      //Remove Session
      const dataReturn = await this.userSessionService.update(dataToUpdate);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleUpdateUserOption(userId: string) {
    const dataCreate = {
      user_id: userId,
    };
    const dataUserOption = await this.userOptionService.create(dataCreate);

    // let levelUser = await this.channelLevelService.findOne({
    //   level_number: 1,
    //   channel_id: process.env.DEFAULT_CHANNEL,
    // });

    //Create Channel Permission
    // let dataToCreateChannel = {
    //   user_id: userId,
    //   channel_id: process.env.DEFAULT_CHANNEL,
    //   official_status: 1,
    //   channel_role: "user",
    //   level_number: 1,
    //   channel_level: levelUser?._id?.toString(),
    //   permission: ["request/create", "request/update"],
    // };
    // await this.channelPermissionService.create(dataToCreateChannel);
    //Update count user

    // const listChallenge = await this.challengeService.filter({
    //   channel_id: process.env.DEFAULT_CHANNEL,
    //   add_all_user: true
    // }, {}, 1, 1000);

    // const userInfo = await this.appUserService.findUserById({
    //   _id: new Types.ObjectId(userId)
    // }, {
    //   _id: true,
    //   display_name: true,
    // })

    // this.queueService.addTaskUserJoinChallenge({
    //   user_id: userId,
    //   list_challenge_id: listChallenge.map((x) => { return { challenge_id: x?._id.toString(), game_id: x?.game_id?._id.toString(), game_type: x?.game_id?.game_type, title: x.title } }),
    //   channel_id: process.env.DEFAULT_CHANNEL,
    //   official_status: 1,
    //   display_name: userInfo?.display_name
    // })

    if (dataUserOption) {
      const dataUpdate = {
        _id: userId,
        user_option_id: dataUserOption._id.toString(),
      };
      await this.appUserService.update(dataUpdate);
      return dataUserOption;
    } else {
      return null;
    }
  }

//   /**
//    *
//    * @param userId
//    * @param cityName
//    * @param countryName
//    */
//   async sendNotificationNew(
//     partnerObject: User,
//     req: ExpressRequestDto,
//     res: Response,
//     cityName: string,
//     countryName: string
//   ) {
//     if (process.env.BRANCH_NAME === "live_video") {
//       return true;
//     }
//     setTimeout(async () => {
//       const supportAccount = await this.appUserService.findOne({ _id: process.env.INFO_USER });
//       //Create new
//       const dataCreateReturnRoom = await this.chatRoomHelper.handleCreateRoom(
//         supportAccount,
//         partnerObject._id.toString(),
//         "personal",
//         "",
//         true
//       );

//       if (!dataCreateReturnRoom) {
//         console.log("Not found");
//       } else {
//         //@ts-ignore
//         const updatedAt = new Date(dataCreateReturnRoom?.updatedAt).getTime();
//         const currentTime = new Date().getTime();

//         //console.log(currentTime - updatedAt);
//         const leftTime = currentTime - updatedAt;
//         //@ts-ignore
//         if (leftTime < 2592000000 && Number(dataCreateReturnRoom?.chat_history_count) > 0) {
//           console.log("Not return");
//           return null;
//         }

//         let chatContent = "";
//         const tokenReturn = this.jwtHelper.generateJwt(
//           process.env.INFO_USER,
//           supportAccount?.user_email?.toString(),
//           process.env.INFO_SESSION,
//           true
//         );
//         let branchName = "WhiteG";
//         if (process.env.BRANCH_NAME === "honee") {
//           branchName = "Honee";
//         }
//         if (countryName === "Vietnam") {
//           const localText = cityName ? ` tại ${cityName}, ${countryName}` : ``;
//           chatContent = `Chào mừng bạn đã đến với ${branchName}${localText} - nơi kết nối & hẹn hò
// 👉 Bạn cần tuân thủ các chính sách của chúng tôi và cùng chúng tôi xây dựng một cộng đồng ${branchName} văn minh, tốt đẹp hơn.
// 👉 Hãy thay đổi ảnh đại điện và đăng tải một đoạn ghi âm để đối phương hiểu bạn hơn nhé.
// ✅ Lưu ý: bạn chỉ có thể nhắn tin với đối phương khi cả 2 bạn cùng thích nhau. Vì thế hãy quẹt phải cho đối phương biết trước nhé.
// 🔔 Nếu gặp bất kì vấn đề nào, hãy liên hệ trực tiếp với chúng tôi bằng tính năng Hỗ trợ.
// 🔔 Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Hy vọng bạn có những trải nghiệm thú vị cùng ${branchName}.`;
//         } else {
//           const localText = cityName ? ` at ${cityName}, ${countryName}` : ``;
//           chatContent = `Welcome to ${branchName}${localText}. Thanks for your believe
// 👉 You have to agree with our privacy policies and join us in creating a civilized ${branchName} community.
// 👉 Please change your personal avatar and upload a sound signature to understand thoroughly.
// ✅ Note: you only chat with others when you both like each other. So please swipe right to let him know first.
// 🔔 If you have any problems, contact us directly using the Support feature.
// 🔔 Thank you for using our service. Hope you have stimulating experiences on ${branchName}.`;
//         }
//         const createChatHistoryDto = {
//           chat_room_id: dataCreateReturnRoom?.chat_room_id?._id?.toString(),
//           chat_content: chatContent,
//         };

//         req.user_id = supportAccount?._id.toString();
//         req.user_object = supportAccount;
//         req.session_id = process.env.INFO_SESSION;
//         req.auth_code = tokenReturn.toString();

//         const dataReturnHistory: any = await this.chatHistoryHelper.createNewHistory(
//           req,
//           res,
//           createChatHistoryDto,
//           false,
//           true
//         );
//       }
//     }, 2000);

//     return true;
//   }

  // /**
  //  *
  //  * @param userId
  //  * @param cityName
  //  * @param countryName
  //  */
  // async sendMessageCallU(partnerObject: User, req: ExpressRequestDto, res: Response, userObject: any) {
  //   //Create new
  //   const dataCreateReturnRoom = await this.chatRoomHelper.handleCreateRoom(
  //     userObject,
  //     partnerObject._id.toString(),
  //     "personal",
  //     "",
  //     true
  //   );

  //   if (!dataCreateReturnRoom) {
  //     console.log("Not found");
  //   } else {
  //     //@ts-ignore
  //     const updatedAt = new Date(dataCreateReturnRoom?.updatedAt).getTime();
  //     const currentTime = new Date().getTime();

  //     //console.log(currentTime - updatedAt);
  //     const leftTime = currentTime - updatedAt;
  //     //@ts-ignore
  //     if (leftTime < 2592000000 && Number(dataCreateReturnRoom?.chat_history_count) > 0) {
  //       console.log("Not return");
  //       return null;
  //     }

  //     let chatContent = "";

  //     //Get User Options
  //     if (userObject?.chat_content) {
  //       chatContent = userObject?.chat_content;
  //     } else {
  //       //Get config Chat Content
  //       //Get country
  //       if (partnerObject?.country) {
  //         const configData = partnerObject?.country + "_message";
  //         const dataFind = {
  //           type: configData,
  //         };
  //         const dataConfig = await this.configService.findOne(dataFind);
  //         if (dataConfig && dataConfig?.data_filter && dataConfig?.data_filter?.length) {
  //           const arrayMessage = dataConfig?.data_filter;
  //           chatContent = _.sample(arrayMessage);
  //         }
  //       }
  //     }
  //     if (chatContent) {
  //       //FindOne Session
  //       const oneSession = await this.userSessionService.findOne({ user_id: userObject._id?.toString() });
  //       const tokenReturn = this.jwtHelper.generateJwt(
  //         userObject?._id?.toString(),
  //         userObject?.user_email?.toString(),
  //         oneSession?._id?.toString(),
  //         true
  //       );
  //       const createChatHistoryDto = {
  //         chat_room_id: dataCreateReturnRoom?.chat_room_id?._id?.toString(),
  //         chat_content: chatContent,
  //       };

  //       req.user_id = userObject?._id.toString();
  //       req.user_object = userObject;
  //       req.session_id = process.env.INFO_SESSION;
  //       req.auth_code = tokenReturn.toString();

  //       const dataReturnHistory: any = await this.chatHistoryHelper.createNewHistory(
  //         req,
  //         res,
  //         createChatHistoryDto,
  //         false,
  //         true
  //       );
  //     }
  //   }

  //   return true;
  // }
}
