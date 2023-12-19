import { Response, Request } from "express";
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
import { CreatePostDto } from "../dto/create-post.dto";
import { PostService } from "../services/post.service";
import { ListPostDto } from "../dto/list-post.dto";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdatePostDto } from "../dto/update-post.dto";
import { Types } from "mongoose";
import { CreatePostCrawlDto } from "../dto/create-post_crawl.dto";
import { PostCrawlService } from "../services/post_crawl.service";
import { ListCategoryDto } from "../dto/list-category.dto";
import axios from "axios";
import { PostCategoryService } from "../services/post_category.service";
import { CreatePostPromptDto } from "../dto/create-post_prompt.dto";
import { PostPromptService } from "../services/post_prompt.service";
import { UpdatePostPromptDto } from "../dto/update-post_prompt.dto";
import { CreateUserPromptDto } from "../dto/create-user_prompt.dto";
import { PostAnonymousService } from "../services/post_anonymous.service";
import { CreateImportPromptDto } from "../dto/create-import_prompt.dto";
import { async } from "rxjs";

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class PostHelper {
  constructor(
    private postCategoryService: PostCategoryService,
    private postService: PostService,
    private postCrawlService: PostCrawlService,
    private userPermissionService: UserPermissionService,
    private postPromptService: PostPromptService,
    private postAnonymousService: PostAnonymousService
  ) {
    setTimeout(async () => {
      // await this.handleUpdateLength();
    }, 1000);
  }

  async handleUpdateLength() {
    const dataAnonymousService = await this.postAnonymousService.filter({}, {}, 1, 20000);
    for (const dataItem of dataAnonymousService) {
      if (parseInt(dataItem?.question_length?.toString()) > 1) {
        continue;
      }
      const dataLength = dataItem?.question?.length;
      const dataLengthAnswer = dataItem?.answer?.length;
      console.log(dataLengthAnswer, "dataLengthAnswer");
      console.log(dataLength, "dataLength");

      const dataToUpdate = {
        _id: dataItem?._id,
        question_length: dataLength,
        answer_length: dataLengthAnswer,
      };
      console.log(dataToUpdate);
      await this.postAnonymousService.update(dataToUpdate);
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewPost(createPostData: CreatePostDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = userObject._id.toString();
      const dataPermission = await this.userPermissionService.isHavePermission(userId, "post/create");
      if (process.env.BRANCH_NAME !== "mojo" && process.env.BRANCH_NAME !== "revu" && !dataPermission) {
        throw new BadRequestException("You haven't permission for this Action!");
      }

      const dataSlug = this.toSlug(createPostData.post_title);
      createPostData = { ...createPostData, ...{ post_slug: dataSlug, user_id: userObject._id.toString() } };

      if (this.validateJson(createPostData?.public_album)) {
        createPostData = {
          ...createPostData,
          ...{
            public_album: JSON.parse(createPostData?.public_album),
          },
        };
      } else {
        createPostData = {
          ...createPostData,
          ...{
            public_album: [],
          },
        };
      }

      if (this.validateJson(createPostData?.downloads)) {
        createPostData = {
          ...createPostData,
          ...{
            downloads: JSON.parse(createPostData?.downloads),
          },
        };
      } else {
        createPostData = {
          ...createPostData,
          ...{
            downloads: [],
          },
        };
      }

      const dataCreate = await this.postService.create(createPostData);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param dataImport
   * @param res
   * @param req
   */
  async importPrompt(dataImport: CreateImportPromptDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = userObject._id.toString();
      const dataPermission = await this.userPermissionService.isHavePermission(userId, "post/create");
      if (!dataPermission) {
        throw new BadRequestException("You haven't permission for this Action!");
      }
      //DataImport
      const dataImportText = dataImport?.text;
      if (!dataImportText) {
        throw new BadRequestException("Not have data!");
      } else {
        //Update
        const dataArray = dataImportText?.split("\n");
        // console.log(dataArray);
        for (const dataText of dataArray) {
          if (dataText && dataText?.trim()) {
            //Process Text
            const dataProcess = await this.processText(dataText, dataImport?.category_id, userId);

            // console.log(dataProcess);
            await this.postPromptService.create(dataProcess);
          }
        }
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json({ status: "Done" });
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param text
   * @returns
   */
  async processText(text: string, categoryId: string, userId: string) {
    let searchArray: any = text.match(/\[(.*?)\]/g);
    text = text.replace(/\[(.*?)\]/g, "{data_1}");
    // console.log(searchArray, "searchArray");
    const textArrayBefore = text.split("{data_1}");
    // console.log(textArrayBefore);

    const dataTextArrayAfter = [];
    for (const item of textArrayBefore) {
      if (item.trim()) {
        dataTextArrayAfter.push(item.trim());
      }
    }
    let textStringToShow = "";

    for (const dataText in dataTextArrayAfter) {
      const dataNumber = Number(dataText) + 1;
      if (dataNumber <= searchArray?.length) {
        textStringToShow = textStringToShow + dataTextArrayAfter[dataText] + " {data_" + dataNumber + "} ";
      } else {
        textStringToShow = textStringToShow + dataTextArrayAfter[dataText];
      }
    }
    // console.log(textStringToShow);
    let textToAI = textStringToShow;
    textToAI = textToAI.replace("in the U.S.", "in the {country}");
    textToAI = textToAI.replace("in the United States", "in the {country}");
    textToAI = textToAI.replace("the U.S.", "the {country}");
    textToAI = textToAI.replace("the US", "the {country}");
    textToAI = textToAI.replace("the United States", "the {country}");
    textToAI = textToAI.replace("United States", "{country}");
    textToAI = textToAI.replace("U.S.", "{country}");

    textStringToShow = textStringToShow.replace("in the United States", "");
    textStringToShow = textStringToShow.replace("in the U.S.", "");
    textStringToShow = textStringToShow.replace("the United States", "");
    textStringToShow = textStringToShow.replace("the U.S.", "");
    textStringToShow = textStringToShow.replace("the US", "");
    textStringToShow = textStringToShow.replace("United States", "{country}");
    textStringToShow = textStringToShow.replace("U.S.", "{country}");
    textStringToShow = textStringToShow.replace("?", "");
    textStringToShow = textStringToShow?.trim();
    if (!searchArray) {
      searchArray = [];
    }
    return {
      text_to_ai: textToAI,
      text_to_view: textStringToShow,
      placeholder: searchArray,
      post_category: categoryId,
      text_to_image: "",
      post_language: "en",
      post_parent: "",
      post_status: "",
      post_avatar: null,
      post_type: "prompt",
      user_id: userId,
    };
  }

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewPostPrompt(createPostData: CreatePostPromptDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = userObject._id.toString();
      const dataPermission = await this.userPermissionService.isHavePermission(userId, "post/create");
      if (!dataPermission) {
        throw new BadRequestException("You haven't permission for this Action!");
      }

      createPostData = { ...createPostData, ...{ user_id: userObject._id.toString() } };

      if (this.validateJson(createPostData?.placeholder)) {
        createPostData = {
          ...createPostData,
          ...{
            placeholder: JSON.parse(createPostData?.placeholder),
          },
        };
      } else {
        createPostData = {
          ...createPostData,
          ...{
            placeholder: [],
          },
        };
      }

      const dataCreate = await this.postPromptService.create(createPostData);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewUserPrompt(createPostData: CreateUserPromptDto, res: Response, req: ExpressRequestDto) {
    try {
      const authCodeHeader = req?.headers;
      let authCodeString = "";
      if (authCodeHeader && authCodeHeader["x-authorization"]) {
        authCodeString = authCodeHeader["x-authorization"]?.toString();
      }
      console.log(authCodeString, "authCodeString");

      const dataCreate = await this.postAnonymousService.create(createPostData);
      const dataReturn = await this.postAnonymousService.findById(dataCreate?._id?.toString());

      const categoryId = dataReturn?.prompt_id?.post_category?._id;
      const postId = dataReturn?.prompt_id?._id;
      //Update for
      const dataFilterCategory = {
        _id: categoryId,
      };
      const dataFilterPost = {
        _id: postId,
      };

      await this.postCategoryService.updateCount(dataFilterCategory, { category_view: 1 });
      await this.postPromptService.updateCount(dataFilterPost, { post_view: 1 });

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
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewCrawlPost(createPostData: CreatePostCrawlDto, res: Response, req: ExpressRequestDto) {
    try {
      const dataCreate = await this.postCrawlService.create(createPostData);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
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
  async updateCrawlData() {
    try {
      const dataCrawlFilter = {
        status: "0",
      };
      const dataTotal = await this.postCrawlService.filter(dataCrawlFilter, {}, 1, 10000);
      if (dataTotal) {
        for (const itemTotal of dataTotal) {
          console.log(itemTotal, "itemTotal");
          try {
            const dataJson = itemTotal.data?.toString();
            const dataObject = JSON.parse(dataJson);

            const dataSearch = {
              post_slug: dataObject?.data?.slug,
            };
            const dataReturn = await this.postService.findOne(dataSearch);

            if (dataReturn) {
              const dataCrawUpdate = {
                _id: itemTotal?._id?.toString(),
                status: "1",
              };
              await this.postCrawlService.update(dataCrawUpdate);
              continue;
            }

            console.log(dataObject);
            let dataToCreate: any = {
              post_type: "news",
              post_status: "publish",
              user_id: "63f5cd6c1dcd482990a26ca4",
            };
            if (dataObject?.data?.description) {
              dataToCreate = { ...dataToCreate, ...{ post_content: dataObject?.data?.description } };
            }
            if (dataObject?.data?.slug) {
              dataToCreate = { ...dataToCreate, ...{ post_slug: dataObject?.data?.slug } };
            }
            if (dataObject?.data?.title) {
              dataToCreate = { ...dataToCreate, ...{ post_title: dataObject?.data?.title } };
            }
            if (dataObject?.data?.installation) {
              dataToCreate = { ...dataToCreate, ...{ installation: dataObject?.data?.installation } };
            }
            if (dataObject?.data?.introduction) {
              dataToCreate = { ...dataToCreate, ...{ introduction: dataObject?.data?.introduction } };
            }
            if (dataObject?.data?.categories) {
              let categorySlug = "";
              const listCategory = ["scripts", "addons", "maps", "skins", "texture-packs", "seeds"];
              for (const dataCategory of dataObject?.data?.categories) {
                if (listCategory.indexOf(dataCategory?.slug) !== -1) {
                  categorySlug = dataCategory?.slug;
                }
              }

              if (categorySlug == "scripts") {
                dataToCreate = { ...dataToCreate, ...{ post_category: "63f5df4b02b49ee516df6d7f" } };
              }
              if (categorySlug == "addons") {
                dataToCreate = { ...dataToCreate, ...{ post_category: "63f5d95c3e634802d7552308" } };
              }
              if (categorySlug == "maps") {
                dataToCreate = { ...dataToCreate, ...{ post_category: "63f5f8553931f3e26e996744" } };
              }
              if (categorySlug == "skins") {
                dataToCreate = { ...dataToCreate, ...{ post_category: "63f5f8703931f3e26e996754" } };
              }
              if (categorySlug == "texture-packs") {
                dataToCreate = { ...dataToCreate, ...{ post_category: "63f5f8623931f3e26e99674c" } };
              }
              if (categorySlug == "seeds") {
                dataToCreate = { ...dataToCreate, ...{ post_category: "63f5f8ab3931f3e26e996896" } };
              }
            }

            console.log(dataToCreate, "dataObject");
            const max = 10000000;
            const min = 50000;
            const dataRandom = Math.floor(Math.random() * (max - min + 1) + min);
            dataToCreate = {
              ...dataToCreate,
              ...{
                post_language: "en",
                post_view: dataRandom,
              },
            };
            if (dataReturn) {
              console.log(dataSearch, "dataSearch");
              dataToCreate = { ...dataToCreate, ...{ _id: dataReturn?._id?.toString() } };
              const dataUpdate = await this.postService.update(dataToCreate);
              console.log(dataUpdate, "dataUpdate");
            } else {
              //Create
              const dataCreate = await this.postService.create(dataToCreate);

              const dataCrawUpdate = {
                _id: itemTotal?._id?.toString(),
                status: "1",
              };
              await this.postCrawlService.update(dataCrawUpdate);
              if (dataObject?.data?.submission_images && dataObject?.data?.submission_images?.length) {
                let countUpdate = 0;
                for (const dataImageCover of dataObject?.data?.submission_images) {
                  countUpdate++;
                  const url = encodeURI(dataImageCover);
                  const apiUrl = `
                  https://media.lgbt.appuni.io/upload-media?callback=https://minecraft.whiteg.app/api/chat-media/create&url=${url}`;
                  const subscriptionKey = process.env.SUBSCRIBE_KEY_DETECT; //change subscription key
                  const optionsFaceCompare = {
                    headers: {
                      subscriptionkey: subscriptionKey,
                      "Content-Type": "application/json",
                      Authorization:
                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDg1OTIxNzEsImRhdGEiOnsiX2lkIjoiNjNmNWNkNmMxZGNkNDgyOTkwYTI2Y2E0Iiwia2V5IjoiZGZlYjM4Y2FkZjMwZGExOTJjZGViYTE5OGIxNTUzZDAiLCJzaWduYXR1cmUiOiJjNGI1NDEzMGQ0MjNhYzc2ZDA1MjYzODAzMWNhYzBmNyIsInNlc3Npb24iOiI2M2Y1ZDhhYjNlNjM0ODAyZDc1NTIyZmEifSwiaWF0IjoxNjc3MDU2MTcxfQ.NK-sQNsOj9wqfmYOWH5u5sde9hnsneqyQR7gdhQ9Pz0",
                    },
                    rejectUnauthorized: false,
                  };
                  const dataAxios = {};

                  const dataResponse = axios
                    .post(apiUrl, dataAxios, optionsFaceCompare)
                    .then(async (response) => {
                      const dataMediaId = response?.data && response?.data[0] && response?.data[0]?.callback?._id;
                      //If
                      if (countUpdate == 1) {
                        const dataUpdate = {
                          _id: dataCreate?._id?.toString(),
                          post_avatar: dataMediaId,
                        };
                        await this.postService.update(dataUpdate);
                      }
                      const dataUpdatePublicAlbum: any = {
                        post_slug: dataCreate?.post_slug,
                        image_public: dataMediaId,
                      };
                      await this.postService.update(dataUpdatePublicAlbum);
                      return response.data;
                    })
                    .catch((error) => {
                      return error?.message;
                    });

                  //console.log(dataResponse, "dataResponse");
                }
              }

              console.log(dataCreate, "dataCreate");
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
      console.log("Done");
      // return res
      //   .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": 0 })
      //   .status(HttpStatus.OK)
      //   .json({ status: "Done" });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateCategory() {
    try {
      const dataCrawlFilter = {
        //status: "0",
      };
      const dataTotal = await this.postService.filter(dataCrawlFilter, {}, 1, 10000);
      if (dataTotal) {
        for (const itemTotal of dataTotal) {
          //console.log(itemTotal, 'itemTotal');
          console.log(itemTotal?.post_slug);
          if (itemTotal?.post_slug) {
            const dataFilter = {
              slug: itemTotal?.post_slug,
            };
            const dataCrawlCheck = await this.postCrawlService.findOne(dataFilter);
            // console.log(dataCrawlCheck, 'dataCrawlCheck')
            if (dataCrawlCheck) {
              try {
                let dataToUpdate = {
                  _id: itemTotal?._id?.toString(),
                };
                const dataObject = JSON.parse(dataCrawlCheck?.data?.toString());
                // console.log(dataObject?.data?.categories);
                let categorySlug = "";
                const listCategory = ["scripts", "addons", "maps", "skins", "texture-packs", "seeds"];
                for (const dataCategory of dataObject?.data?.categories) {
                  if (listCategory.indexOf(dataCategory?.slug) !== -1) {
                    categorySlug = dataCategory?.slug;
                  }
                }

                if (categorySlug == "scripts") {
                  dataToUpdate = { ...dataToUpdate, ...{ post_category: "63f5df4b02b49ee516df6d7f" } };
                }
                if (categorySlug == "addons") {
                  dataToUpdate = { ...dataToUpdate, ...{ post_category: "63f5d95c3e634802d7552308" } };
                }
                if (categorySlug == "maps") {
                  dataToUpdate = { ...dataToUpdate, ...{ post_category: "63f5f8553931f3e26e996744" } };
                }
                if (categorySlug == "skins") {
                  dataToUpdate = { ...dataToUpdate, ...{ post_category: "63f5f8703931f3e26e996754" } };
                }
                if (categorySlug == "texture-packs") {
                  dataToUpdate = { ...dataToUpdate, ...{ post_category: "63f5f8623931f3e26e99674c" } };
                }
                if (categorySlug == "seeds") {
                  dataToUpdate = { ...dataToUpdate, ...{ post_category: "63f5f8ab3931f3e26e996896" } };
                }
                console.log(dataToUpdate, "dataToUpdate");
                await this.postService.update(dataToUpdate);
                console.log(categorySlug);
                console.log("-------------------- DONE ---------------");
              } catch (error) {
                console.log(error);
              }
            }
          }
        }
      }
      console.log("Done");
      // return res
      //   .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": 0 })
      //   .status(HttpStatus.OK)
      //   .json({ status: "Done" });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateImage() {
    try {
      const dataCrawlFilter = {
        not_image: "1",
      };
      const dataTotal: any = await this.postService.filter(dataCrawlFilter, {}, 1, 10000);
      if (dataTotal) {
        let count = 0;
        for (const itemTotal of dataTotal) {
          //console.log(itemTotal, 'itemTotal');
          count++;
          console.log(itemTotal?.public_album);

          const dataCreate = {
            _id: itemTotal?._id?.toString(),
            public_album: [itemTotal?.post_avatar?._id?.toString()],
          };
          console.log(dataCreate);
          await this.postService.update(dataCreate);
          // setTimeout(async () => {
          //   if (itemTotal?.post_slug) {
          //     let dataFilter = {
          //       slug: itemTotal?.post_slug,
          //     };
          //     let dataCrawlCheck = await this.postCrawlService.findOne(dataFilter);
          //     // console.log(dataCrawlCheck, 'dataCrawlCheck')
          //     if (dataCrawlCheck) {
          //       try {
          //         let dataCreate = {
          //           _id: itemTotal?._id?.toString(),
          //         };
          //         let dataObject = JSON.parse(dataCrawlCheck?.data?.toString());
          //         // console.log(dataObject?.data?.categories);

          //         if (dataObject?.data?.image) {
          //           let url = encodeURI(dataObject?.data?.image);
          //           const apiUrl = `
          //             https://media.lgbt.appuni.io/upload-media?callback=https://minecraft.whiteg.app/api/chat-media/create&url=${url}`;
          //           const subscriptionKey = process.env.SUBSCRIBE_KEY_DETECT; //change subscription key
          //           var optionsFaceCompare = {
          //             headers: {
          //               subscriptionkey: subscriptionKey,
          //               "Content-Type": "application/json",
          //               Authorization:
          //                 "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDg1OTIxNzEsImRhdGEiOnsiX2lkIjoiNjNmNWNkNmMxZGNkNDgyOTkwYTI2Y2E0Iiwia2V5IjoiZGZlYjM4Y2FkZjMwZGExOTJjZGViYTE5OGIxNTUzZDAiLCJzaWduYXR1cmUiOiJjNGI1NDEzMGQ0MjNhYzc2ZDA1MjYzODAzMWNhYzBmNyIsInNlc3Npb24iOiI2M2Y1ZDhhYjNlNjM0ODAyZDc1NTIyZmEifSwiaWF0IjoxNjc3MDU2MTcxfQ.NK-sQNsOj9wqfmYOWH5u5sde9hnsneqyQR7gdhQ9Pz0",
          //             },
          //             rejectUnauthorized: false,
          //           };
          //           let dataAxios = {};

          //           let dataResponse = axios
          //             .post(apiUrl, dataAxios, optionsFaceCompare)
          //             .then(async (response) => {
          //               console.log(response, "response");
          //               let dataMediaId = response?.data && response?.data[0] && response?.data[0]?.callback?._id;
          //               console.log(dataMediaId, "dataMediaId");
          //               //If
          //               if (dataMediaId) {
          //                 let dataUpdate = {
          //                   _id: dataCreate?._id?.toString(),
          //                   post_avatar: dataMediaId,
          //                 };
          //                 await this.postService.update(dataUpdate);
          //               }
          //               return response.data;
          //             })
          //             .catch((error) => {
          //               return error?.message;
          //             });
          //         }
          //         if (dataObject?.data?.submission_images && dataObject?.data?.submission_images?.length) {
          //           let countUpdate = 0;
          //           for (let dataImageCover of dataObject?.data?.submission_images) {
          //             countUpdate++;
          //             let url = encodeURI(dataImageCover);
          //             const apiUrl = `
          //             https://media.lgbt.appuni.io/upload-media?callback=https://minecraft.whiteg.app/api/chat-media/create&url=${url}`;
          //             const subscriptionKey = process.env.SUBSCRIBE_KEY_DETECT; //change subscription key
          //             var optionsFaceCompare = {
          //               headers: {
          //                 subscriptionkey: subscriptionKey,
          //                 "Content-Type": "application/json",
          //                 Authorization:
          //                   "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDg1OTIxNzEsImRhdGEiOnsiX2lkIjoiNjNmNWNkNmMxZGNkNDgyOTkwYTI2Y2E0Iiwia2V5IjoiZGZlYjM4Y2FkZjMwZGExOTJjZGViYTE5OGIxNTUzZDAiLCJzaWduYXR1cmUiOiJjNGI1NDEzMGQ0MjNhYzc2ZDA1MjYzODAzMWNhYzBmNyIsInNlc3Npb24iOiI2M2Y1ZDhhYjNlNjM0ODAyZDc1NTIyZmEifSwiaWF0IjoxNjc3MDU2MTcxfQ.NK-sQNsOj9wqfmYOWH5u5sde9hnsneqyQR7gdhQ9Pz0",
          //               },
          //               rejectUnauthorized: false,
          //             };
          //             let dataAxios = {};

          //             let dataResponse = axios
          //               .post(apiUrl, dataAxios, optionsFaceCompare)
          //               .then(async (response) => {
          //                 console.log(response, "response");
          //                 let dataMediaId = response?.data && response?.data[0] && response?.data[0]?.callback?._id;
          //                 console.log(dataMediaId, "dataMediaId");
          //                 //If
          //                 if (dataMediaId) {
          //                   let dataUpdatePublicAlbum: any = {
          //                     post_slug: itemTotal?.post_slug,
          //                     image_public: dataMediaId,
          //                   };
          //                   await this.postService.update(dataUpdatePublicAlbum);
          //                 }

          //                 return response.data;
          //               })
          //               .catch((error) => {
          //                 return error?.message;
          //               });

          //             //console.log(dataResponse, "dataResponse");
          //           }
          //         }

          //         // console.log(dataToUpdate, "dataToUpdate");
          //         // await this.postService.update(dataToUpdate);
          //         // console.log(categorySlug);
          //         console.log("-------------------- DONE ---------------");
          //       } catch (error) {
          //         console.log(error);
          //       }
          //     }
          //   }
          // }, count * 2000);
        }
      }
      console.log("Done");
      // return res
      //   .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": 0 })
      //   .status(HttpStatus.OK)
      //   .json({ status: "Done" });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateCrawlFirst() {
    try {
      const dataCrawlFilter = {
        //status: "0",
      };
      const dataTotal = await this.postService.filter(dataCrawlFilter, {}, 1, 10000);
      if (dataTotal) {
        for (const itemTotal of dataTotal) {
          const postSlug = itemTotal?.post_slug;
          console.log(postSlug, "postSlug");
          const dataFilter = {
            slug: postSlug,
          };
          const dataCrawlCheck = await this.postCrawlService.findOne(dataFilter);
          if (dataCrawlCheck) {
            const dataUpdate = {
              _id: dataCrawlCheck?._id?.toString(),
              status: "1",
            };
            console.log(dataUpdate, "dataUpdate");
            console.log("-------------DONE-------------");
            await this.postCrawlService.update(dataUpdate);
          }
        }
      }
      console.log("Done");
      // return res
      //   .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": 0 })
      //   .status(HttpStatus.OK)
      //   .json({ status: "Done" });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  async updateDownload() {
    try {
      const dataCrawlFilter = {
        //status: "0",
      };
      const dataTotal = await this.postService.filter(dataCrawlFilter, {}, 1, 10000);
      if (dataTotal) {
        for (const itemTotal of dataTotal) {
          const dataToUpdate = {
            _id: itemTotal?._id?.toString(),
          };

          //console.log(itemTotal, 'itemTotal');
          console.log(itemTotal?.post_slug);
          if (itemTotal?.post_slug) {
            const max = 10000000;
            const min = 50000;
            const dataRandom = Math.floor(Math.random() * (max - min + 1) + min);
            const dataFilter = {
              _id: itemTotal?._id?.toString(),
              post_view: dataRandom,
            };
            console.log(dataFilter);
            await this.postService.update(dataFilter);
            console.log("-------------------- DONE ---------------");
          }
        }
      }
      console.log("Done");
      // return res
      //   .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": 0 })
      //   .status(HttpStatus.OK)
      //   .json({ status: "Done" });
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
  async getPostListByAdmin(query: ListPostDto, res: Response, req: ExpressRequestDto) {
    try {
      // let userObject = req?.user_object;
      // if (!userObject) {
      //   throw new ForbiddenException("User is invalid");
      // }
      // let userId = userObject._id.toString();
      // if (await this.userPermissionService.isHavePermission(userId, "order/list")) {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by && (query.order_type == "time" || !query?.order_type)) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      if (query.order_by && query.order_type == "download") {
        orderByOBject = { ...orderByOBject, ...{ post_view: query.order_by } };
      }
      let dataToFilter = { ...query };

      if (query?.post_category) {
        //Check category
        const totalCategoryFilter = {
          category_parent: query?.post_category,
        };
        const dataCategory = await this.postCategoryService.filter(totalCategoryFilter, {}, 1, 100);
        const dataToFilterCategory = [query?.post_category];
        if (dataCategory && dataCategory?.length) {
          for (const dataCategoryItem of dataCategory) {
            dataToFilterCategory.push(dataCategoryItem?._id?.toString());
          }
        }
        dataToFilter = { ...dataToFilter, ...{ categories: dataToFilterCategory } };
        delete dataToFilter.post_category;
      }

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.postService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.postService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
      // } else {
      //   throw new BadRequestException("You haven't permission for this Action!");
      // }
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
  async getPostListPrompt(query: ListPostDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by && (query.order_type == "time" || !query?.order_type)) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      if (query.order_by && query.order_type == "download") {
        orderByOBject = { ...orderByOBject, ...{ post_view: query.order_by } };
      }
      let dataToFilter = { ...query };

      if (query?.post_category) {
        //Check category
        const totalCategoryFilter = {
          category_parent: query?.post_category,
        };
        const dataCategory = await this.postCategoryService.filter(totalCategoryFilter, {}, 1, 100);
        const dataToFilterCategory = [query?.post_category];
        if (dataCategory && dataCategory?.length) {
          for (const dataCategoryItem of dataCategory) {
            dataToFilterCategory.push(dataCategoryItem?._id?.toString());
          }
        }
        dataToFilter = { ...dataToFilter, ...{ categories: dataToFilterCategory } };
        delete dataToFilter.post_category;
      }

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.postPromptService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.postPromptService.count(dataToFilter);
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
  async getPostUserList(query: ListPostDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      const dataToFilter = { ...query };

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.postAnonymousService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.postAnonymousService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param str
   * @returns
   */
  validateJson(str: string) {
    try {
      const dataJson = JSON.parse(str);
      if (dataJson?.length === 0) {
        return false;
      } else {
        return true;
      }
    } catch (e) {
      return false;
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
  async getPostListByUser(query: ListPostDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      const dataToFilter = { ...query, ...{ user_id: userId } };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.postService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.postService.count(dataToFilter);
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
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleGetDetailPost(id: string, res: Response, req: ExpressRequestDto) {
    try {
      if (!id) {
        throw new ForbiddenException("Id is not invalid");
      }
      let objectId = null;
      try {
        objectId = new Types.ObjectId(id.toString());
      } catch (error) {
        objectId = null;
      }
      //Check Permission

      let dataToFilter = {};
      if (objectId) {
        dataToFilter = { ...dataToFilter, ...{ _id: objectId } };
      } else {
        dataToFilter = { ...dataToFilter, ...{ post_slug: id.toString() } };
      }
      const dataReturn = await this.postService.findOne(dataToFilter);
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
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleGetDetailPostPrompt(id: string, res: Response, req: ExpressRequestDto) {
    try {
      if (!id) {
        throw new ForbiddenException("Id is not invalid");
      }
      let objectId = null;
      try {
        objectId = new Types.ObjectId(id.toString());
      } catch (error) {
        objectId = null;
      }
      //Check Permission

      let dataToFilter = {};
      if (objectId) {
        dataToFilter = { ...dataToFilter, ...{ _id: objectId } };
      }
      const dataReturn = await this.postPromptService.findOne(dataToFilter);
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
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleUpdatePostByAdmin(dataUpdate: UpdatePostDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      //if (dataUpdate.post_slug) {
      //let dataToFind = await this.postService.findOne({ post_slug: dataUpdate.post_slug });
      // if (dataToFind && dataToFind._id.toString() !== dataUpdate?._id.toString()) {
      //   throw new ForbiddenException("Slug is exist!");
      // }
      //}
      const userId = userObject._id.toString();
      console.log(userId);

      const dataPermission = await this.userPermissionService.isHavePermission(userId, "post/update");
      if (process.env.BRANCH_NAME !== "mojo" && process.env.BRANCH_NAME !== "revu" && !dataPermission) {
        throw new BadRequestException("You haven't permission for this Action!");
      }

      if (dataUpdate.public_album) {
        dataUpdate = { ...dataUpdate, ...{ public_album: JSON.parse(dataUpdate.public_album) } };
      }

      if (dataUpdate.downloads) {
        dataUpdate = { ...dataUpdate, ...{ downloads: JSON.parse(dataUpdate.downloads) } };
      }

      const dataReturn = await this.postService.update(dataUpdate);
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
  async handleUpdatePostPromptByAdmin(dataUpdate: UpdatePostPromptDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();

      const dataPermission = await this.userPermissionService.isHavePermission(userId, "post/update");
      if (!dataPermission) {
        throw new BadRequestException("You haven't permission for this Action!");
      }

      if (dataUpdate.placeholder) {
        const dataPlaceHolder = [];

        const objectPrepare = JSON.parse(dataUpdate.placeholder);
        for (const dataItem of objectPrepare) {
          if (dataItem) {
            dataPlaceHolder.push(dataItem);
          }
        }

        dataUpdate = { ...dataUpdate, ...{ placeholder: dataPlaceHolder } };
      }

      const dataReturn = await this.postPromptService.update(dataUpdate);
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
  async handleDeletePost(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "post/delete")) {
        //Check Permission
        const dataReturn = await this.postService.remove(id);
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
  async handleDeletePostPrompt(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "post/delete")) {
        //Check Permission
        const dataReturn = await this.postPromptService.remove(id);
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
   *
   * @param str
   * @returns
   */
  toSlug(str: string) {
    str = str.toLowerCase();
    str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, "a");
    str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, "e");
    str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, "i");
    str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, "o");
    str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, "u");
    str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, "y");
    str = str.replace(/(đ)/g, "d");
    str = str.replace(/([^0-9a-z-\s])/g, "");
    str = str.replace(/(\s+)/g, "-");
    str = str.replace(/^-+/g, "");
    str = str.replace(/-+$/g, "");
    const date = new Date().getTime();
    return str + "-" + date;
  }
}
