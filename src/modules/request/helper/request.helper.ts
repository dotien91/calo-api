import { BadRequestException, ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";
import cheerio from "cheerio";
import { Response } from "express";
import { Types } from "mongoose";
import { DecodeUserToken } from "../../../dto/decode-user-token.dto";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { Channel } from "../../../modules/channel/schemas/channel.schema";
import { ChannelService } from "../../../modules/channel/services/channel.service";
import { ChannelPermissionService } from "../../../modules/channel/services/channel_permission.service";
import { EventHookWorkerService } from "../../../modules/hook/services/hook_do.service";
import { NotificationHelper } from "../../../modules/notification/helper/notification.helper";
import { User } from "../../../modules/user/schemas/user.schema";
import { UserService } from "../../../modules/user/services/user.service";
import { UserAnonymousService } from "../../../modules/user/services/user_anonymous.service";
import { UserAnonymousSessionService } from "../../../modules/user/services/user_anonymous_session.service";
import { UserFollowService } from "../../../modules/user/services/user_follow.service";
import { UserOptionService } from "../../../modules/user/services/user_option.service";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import HookExpress from "../../hook/hook_epress";
import { CreateRequestDto } from "../dto/create-request.dto";
import { CreateRequestCategoryDto } from "../dto/create-request_category.dto";
import { CreateRequestCommentDto } from "../dto/create-request_comment.dto";
import { CreateRequestLikeDto } from "../dto/create-request_like.dto";
import { CreateRequestPollDto } from "../dto/create-request_poll.dto";
import { FilterListVote } from "../dto/filter-list_vote.dto";
import { ListRequestDto } from "../dto/list-request.dto";
import { ListRequestCategoryDto } from "../dto/list-request_category.dto";
import { ListRequestCommentDto } from "../dto/list-request_comment.dto";
import { ListRequestLikeDto } from "../dto/list-request_like.dto";
import { UpdateRequestDto } from "../dto/update-request.dto";
import { UpdateRequestCategoryDto } from "../dto/update-request_category.dto";
import { UpdateRequestCommentDto } from "../dto/update-request_comment.dto";
import { RequestComment } from "../schemas/request-comment.schema";
import { Request as RequestNew } from "../schemas/request.schema";
import { RequestService } from "../services/request.service";
import { RequestCategoryService } from "../services/request_category.service";
import { RequestCommentService } from "../services/request_comment.service";
import { RequestDisLikeService } from "../services/request_dislike.service";
import { RequestLikeService } from "../services/request_like.service";
import { RequestPollService } from "../services/request_poll.service";
const { getFirestore } = require("firebase-admin/firestore");
const dataCrawl = `Other`;
let initHook = false;

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class RequestHelper {
  constructor(
    private requestService: RequestService,
    private requestCategoryService: RequestCategoryService,
    private userPermissionService: UserPermissionService,
    private requestLikeService: RequestLikeService,
    private requestDisLikeService: RequestDisLikeService,
    private requestCommentService: RequestCommentService,
    private userAnonymousSession: UserAnonymousSessionService,
    private userAnonymousService: UserAnonymousService,
    private userService: UserService,
    private userOptionService: UserOptionService,
    private notificationHelper: NotificationHelper,
    private requestPollService: RequestPollService,
    private channelPermissionService: ChannelPermissionService,
    private userFollowService: UserFollowService,
    private channelService: ChannelService,
    private readonly eventHookWorkerService: EventHookWorkerService
  ) {
    if (!initHook) {
      this.initHook();
      initHook = true;
    }
    // this.updateRequest();
    setTimeout(() => {
      // this.processCategory();
      // this.handleProcessReddit();
      // this.handleRedditCategory();
      // this.handleUpdateCount();
      // let cronJob = new CronJob(CronExpression.EVERY_12_HOURS, async () => {
      //   try {
      //     // await this.bar();
      //     console.log("Start Cron Job Every Day at 1am");
      //     this.handleRedditCategory();
      //   } catch (e) {
      //     console.error(e);
      //   }
      // });
      // // Start job
      // if (!cronJob.running) {
      //   cronJob.start();
      // }
      // this.handleCategory();
    }, 1000);
  }

  initHook() {
    HookExpress.add_action("request.add-category", async (data: any) => {
      await this.processCategoryWhenCreateChannel(data);
    });
  }

  async handleUpdateCount() {
    try {
      const dataRequest = await this.requestService.filter({}, {}, 1, 1000);
      for (const dataItem of dataRequest) {
        console.log(dataItem?.user_id?.user_avatar);
        if (!dataItem?.user_id?.user_avatar) {
          console.log("NOT HAVE");
          const dataUpdate = {
            _id: dataItem?._id,
            vote_number: 0,
            trending_number: 0,
            popular_number: 0,
          };
          await this.requestService.update(dataUpdate);
        }
      }
    } catch (error) {}
  }
  async handleRedditCategory() {
    // let dataFilter: any = await this.requestService.filter({post_category: '64a672f9eee28fcd235ebe01'}, {}, 1, 100);
    // for (let itemFilter of dataFilter) {
    //   console.log(itemFilter.createdAt?.toString()?.indexOf('Jul 11 2023') !== -1);
    //   if (itemFilter.createdAt?.toString()?.indexOf('Jul 11 2023') !== -1) {
    //     await this.requestService.remove(itemFilter?._id?.toString())
    //   }
    // }
    // return true;

    const urlToCrawl = "https://www.reddit.com/r/legaladvice";
    const dataAxios = await axios
      .get(urlToCrawl)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        // console.log(error, "error");
        return null;
      });
    if (dataAxios) {
      const dataJquery = cheerio.load(dataAxios);
      const dataScript = dataJquery("#data");
      //  console.log(dataScript.html());
      const fs = require("fs");

      // // fs.writeFileSync("foo.txt", dataAxios);
      fs.writeFileSync("foo2.txt", dataScript.text());
      const dataText = dataScript.text()?.replace("};", "}").replace("window.___r = ", "");
      const dataJson = JSON.parse(dataText);
      let count = 0;
      for (const [key, value] of Object.entries(dataJson?.posts?.models)) {
        //@ts-ignore
        if (value?.permalink?.indexOf("redditads") === -1) {
          //@ts-ignore
          const dataUrl = value?.permalink;
          // if (count == 0) {
          await this.handleProcessReditByUrl(dataUrl);
          // }
          count++;
        }
      }

      // if (dataJson?.posts?.models) {
      //   for (let dataItem of dataJson?.posts?.models) {
      //     console.log(dataItem, 'dataItem')
      //     console.log(dataItem?.permalink);
      //   }
      // }
    }
    return true;
    const dataUrl = "https://gql.reddit.com/";
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxNjg5MTMwNzE1LjQyODE4MiwiaWF0IjoxNjg5MDQ0MzE1LjQyODE4MiwianRpIjoic2I1WEsyc05mUElXczV1WXZPUlNta1NCd1F4UExRIiwiY2lkIjoiOXRMb0Ywc29wNVJKZ0EiLCJsaWQiOiJ0Ml8xdWVud2pzaCIsImFpZCI6InQyXzF1ZW53anNoIiwibGNhIjoxNTMyNDM4MjEzNDIwLCJzY3AiOiJlSnhra2RHTzlDQUloZC1GYTVfZ2Y1VV9tNDFWT2tOV3BRSHNaTjUtWXl1ZEpudlZBLWRUNGZRX1lJMVVJTUJHQkFGaVN0eWJRWUFrbURPWlFnRE1ORHByaVNRUTRFbHFMRzhJUUJtYmtRMVphTWNhVzN3Z0JLaWNFN2VWSHBjMm9hVWJpNTRkdjZweUxqeXBPVWZsM05qbUxXeFA5RE1icTAycFdOWlRtY1IxcFhRV0xfb1pPOVMzOXVVel9TYTBSOE9LcXZHQm95TVk4X0haV01aaUd2ZnhucHIwWkYwd3E3M0xRV3BmNnJHNzlrV1QwREs0X1J4dnZEYVRHWEplbXA3Ul90MzFTLWpBUGNfTDlOcUJHYXY3WHJydFdidF8xUTVVemlqUldKejROQnk1Y3ZrZXZ3VGJOZWxmNDNaa0xMNFpjZE1iZm1zNk9uSng0dENuOGZVYkFBRF9fMThTMkZFIiwicmNpZCI6IlE4RFRSem0zMkdjeTVmbUpZOUx0Z1NYZnlQMkhHQ2NCdXg3NU1Bd2JOd1EiLCJmbG8iOjJ9.KC-SgoAO8awrQEO5YLAIMQYbGuchTrQ5T7j5afXPFlJaon3FrnFty1Q7Ow1OLzLO_J43QMYGgQCeM3R2iRQB6r52mfP0F7Gxznq8xUOf-jF8SbySXPz5Lns1qo5dHvtxzLA8nuu6Av_JzBGjIXBRrQWdQweITjN1pCmwiRCFC0F8l5F7ofrI2fI9wuTgffRhNXlpEcbolQSmWyo82OKjJq11WDXtABONz6a7ottcU5lCFS0pgcYPDpe_DqNwbfC3rQPYKK6qsmk0oNtWobZSo9Cr2XJdp1pTlHwWY54aY6VNPUYDlcL6VYHc0cCVxopD2vqaxJONDuHeyyqLOo_3dw",
      },
    };
    const dataPayload = {
      id: "abb696a96055",
      variables: {
        subredditName: "legaladvice",
        isFake: false,
        sort: "HOT",
        adContext: {
          layout: "CARD",
          clientSignalSessionData: {
            adsSeenCount: 4,
            totalPostsSeenCount: 29,
            sessionStartTime: "2023-07-10T04:42:38.544Z",
          },
        },
        includeAchievementFlairs: true,
        includeCustomEmojis: true,
        includeIdentity: true,
        includeInterestTopics: false,
        includeQuestions: true,
        includeRules: false,
        includeRedditorKarma: false,
        includeSubredditLinks: false,
        includeSubredditRankings: true,
        includeSubredditChannels: true,
        includeTopicLinks: false,
      },
    };
    const dataReturn = await axios
      .post(dataUrl, dataPayload, config)
      .then((response) => {
        return response?.data;
      })
      .catch((error) => {
        console.log(error, "error");
        return null;
      });
    if (dataReturn) {
      // console.log(dataReturn?.data?.subredditInfoByName, 'dataReturn?.data?.subredditInfoByName')
      const dataElement = dataReturn?.data?.subredditInfoByName?.elements?.edges;
      if (dataElement && dataElement?.length) {
        let dataCount = 0;
        for (const dataItemElm of dataElement) {
          console.log(dataItemElm?.node?.id);
          if (dataItemElm?.node?.id) {
            if (dataCount == 0) {
              await this.handleProcessReddit(dataItemElm?.node?.id);
            }

            dataCount++;
          }
        }
      }
    }
    // console.log(dataReturn, 'dataReturn')
  }

  async handleProcessReditByUrl(dataUrl: any) {
    try {
      const dataAxios = await axios
        .get(dataUrl)
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          return null;
        });
      if (dataAxios) {
        const fs = require("fs");

        // // fs.writeFileSync("foo.txt", dataAxios);
        fs.writeFileSync("foo2.txt", dataAxios);

        const dataJquery = cheerio.load(dataAxios);
        const dataShReddit = dataJquery("shreddit-post");
        // console.log(dataShReddit, "dataShReddit");
        const dataAuthor = dataShReddit.attr("author");
        const dataTitle = dataShReddit.attr("post-title");
        const dataLanguage = dataShReddit.attr("post-language");
        const dataComment = dataShReddit.attr("content-href");
        let dataTextContent = dataJquery(".text-neutral-content.text-14").text();
        // console.log(dataTextContent, "dataTextContent");
        dataTextContent = dataTextContent.replace(/  +/g, " ");
        dataTextContent = dataTextContent.replace(/\n +/g, "\n");
        dataTextContent = dataTextContent.trim();
        // console.log(dataTextContent, "dataTextContent new");
        const dataScores = dataShReddit.attr("score");
        const commentCount = dataShReddit.attr("comment-count");
        const postId = dataShReddit.attr("id");
        // console.log(postId, "postId");
        // console.log(dataTitle, "dataTitle");

        let categories = "";

        let categoryId = null;
        if (categories) {
          const dataSearch = {
            search: categories?.replace(".", ""),
          };
          const dataCategory = await this.requestCategoryService.filter(dataSearch, {}, 1, 1);
          // console.log(dataCategory, "dataCategory");
          if (dataCategory && dataCategory[0]) {
            categoryId = dataCategory[0]?._id?.toString();
          }
        } else {
          categoryId = "64a672f9eee28fcd235ebe01";
        }

        const author = dataAuthor;
        let email = "";
        if (author) {
          email = this.toSlug(author) + "@gmail.com";
        }

        // console.log(dataText, "dataText");
        let userObject = null;

        if (email) {
          //Create new User
          const dataCreateUser = {
            user_email: email,
            user_login: email,
            display_name: author,
            user_status: 1,
          };
          userObject = await this.userService.findOne({ user_login: email });
          if (!userObject) {
            userObject = await this.userService.create(dataCreateUser);
            await this.handleUpdateUserOption(userObject?._id?.toString());
          }
          // console.log(userObject, "userObject");
        }

        let dataRequest = {
          post_category: categoryId,
          post_content: dataTextContent,
          post_title: dataTitle,
          post_language: "en",
          country: "US",
          trending_number: 0,
          vote_number: 0,
          popular_number: 0,
          comment_number: commentCount,
        };

        const dataSlug = this.toSlug(dataTitle);

        if (dataSlug && userObject) {
          dataRequest = { ...dataRequest, ...{ post_slug: dataSlug, user_id: userObject._id.toString() } };
        }

        const dataRequestSearch = await this.requestService.findOne({ post_slug: dataSlug });
        // console.log(dataRequestSearch, "dataRequestSearch");
        // console.log(dataRequest, "dataRequest");
        let dataCreate = null;
        if (!dataRequestSearch && dataSlug) {
          //Create
          dataCreate = await this.requestService.create(dataRequest);
        } else {
          if (dataRequestSearch) {
            dataRequest = { ...dataRequest, ...{ _id: dataRequestSearch._id?.toString() } };
            dataCreate = await this.requestService.update(dataRequest);
          }
        }

        if (dataCreate) {
          //Update comment
          await this.handleCrawlComment(postId, dataCreate?._id);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   *
   * @param dataAuthor
   * @returns
   */
  async handleCreateUser(dataAuthor: string) {
    try {
      const author = dataAuthor;
      let email = "";
      if (author) {
        email = this.toSlug(author) + "@gmail.com";
      }

      // console.log(dataText, "dataText");
      let userObject = null;

      if (email) {
        //Create new User
        const dataCreateUser = {
          user_email: email,
          user_login: email,
          display_name: author,
          user_status: 1,
        };
        userObject = await this.userService.findOne({ user_login: email });
        if (!userObject) {
          userObject = await this.userService.create(dataCreateUser);
          await this.handleUpdateUserOption(userObject?._id?.toString());
        }

        console.log(userObject, "userObject");
        return userObject;
      }
    } catch (error) {
      return null;
    }
  }

  async handleCrawlComment(dataUrl: string, localId: string) {
    const dataAxios = await axios
      .get(
        `https://gateway.reddit.com/desktopapi/v1/postcomments/${dataUrl}?rtj=only&emotes_as_images=true&redditWebClient=web2x&app=web2x-client-production&profile_img=true&include=identity&subredditName=legaladvice&hasSortParam=false&instanceId&include_categories=true&onOtherDiscussions=false&comment_awardings_by_current_user=true`
      )
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
        return null;
      });
    if (!dataAxios) {
      return null;
    }

    console.log(dataAxios, "dataAxios");

    const fs = require("fs");

    fs.writeFileSync("foo3.txt", JSON.stringify(dataAxios));
    const dataPost = dataAxios?.posts[dataUrl];
    const dataFlair = dataPost?.flair;
    if (dataFlair && dataFlair[0]) {
      const dataCategory = dataFlair[0]?.text?.toString();
      console.log(dataCategory, "dataCategory");
      if (dataCategory) {
        //Update
        if (dataCategory) {
          const dataSearch = {
            search: dataCategory?.replace(".", ""),
          };
          const dataCategoryObject = await this.requestCategoryService.filter(dataSearch, {}, 1, 1);
          console.log(dataCategoryObject, "dataCategory");
          if (dataCategoryObject && dataCategoryObject[0]) {
            const categoryId = dataCategoryObject[0]?._id?.toString();
            const dataUpdateCategory = {
              post_category: categoryId,
              _id: localId,
            };
            await this.requestService.update(dataUpdateCategory);
          }
        }
      }
    }
    const dataComment: any = dataAxios?.comments;
    console.log(dataComment, "dataComment");

    for (const [key, dataCommentItem] of Object.entries(dataComment)) {
      //Check comment in DB
      //@ts-ignore
      const dataCheckComment = await this.requestCommentService.findOne({ ref_id: dataCommentItem.id });
      if (!dataCheckComment) {
        //Update
        //@ts-ignore
        // console.log(dataCommentItem?.media?.richtextContent, "rick");
        let dataText = "";
        //@ts-ignore
        for (const dataItem of dataCommentItem?.media?.richtextContent?.document) {
          // console.log(dataItem?.c);
          const dataComment = dataItem?.c;
          for (const dataItemCommentText of dataItem?.c) {
            if (dataItemCommentText.t) {
              dataText = dataText + dataItemCommentText.t + "\n";
            }
          }
        }
        // console.log(dataText, "dataText");
        let idParent = null;
        if (dataText) {
          let dataToCreate = {
            request_id: localId,
            content: dataText,
            //@ts-ignore
            ref_id: dataCommentItem?.id,
            //@ts-ignore
            ref_parent_id: dataCommentItem?.parentId,
          };
          //@ts-ignore
          const authorName = dataCommentItem?.author;
          const dataUser = await this.handleCreateUser(authorName);
          if (dataUser) {
            dataToCreate = { ...dataToCreate, ...{ user_id: dataUser?._id?.toString() } };
          }
          //@ts-ignore
          if (dataCommentItem?.parentId) {
            //@ts-ignore
            const dataParent = await this.requestCommentService.findOne({ ref_id: dataCommentItem?.parentId });
            if (dataParent) {
              idParent = dataParent?._id?.toString();
              dataToCreate = { ...dataToCreate, ...{ parent_id: idParent } };
            }
          }
          console.log(dataToCreate, "dataToCreate");
          const dataCreateComment = await this.requestCommentService.create(dataToCreate);
        }
      }
    }

    // console.log(dataPost, "dataPost");
    // console.log(dataPost?.title);
    // let dataTitle = dataPost?.title;
  }

  async handleProcessReddit(dataUrl: any = "t2_8gksn5vzl") {
    console.log(dataUrl, "dataUrl");
    const dataAxios = await axios
      .get(
        `https://gateway.reddit.com/desktopapi/v1/postcomments/${dataUrl}?rtj=only&emotes_as_images=true&redditWebClient=web2x&app=web2x-client-production&profile_img=true&include=identity&subredditName=legaladvice&hasSortParam=false&instanceId&include_categories=true&onOtherDiscussions=false&comment_awardings_by_current_user=true`
      )
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
        return null;
      });
    if (!dataAxios) {
      return null;
    }

    console.log(dataAxios, "dataAxios");
    const dataPost = dataAxios?.posts[dataUrl];
    console.log(dataPost, "dataPost");
    console.log(dataPost?.title);
    const dataTitle = dataPost?.title;
    console.log(dataPost?.media?.richtextContent?.document);

    let dataText = "";
    if (dataPost?.media?.richtextContent?.document) {
      for (const dataItem of dataPost?.media?.richtextContent?.document) {
        console.log(dataItem.c);
        for (const dataItemC of dataItem.c) {
          console.log(dataItemC, "dataItemC");
          console.log(dataItemC.t);
          dataText = dataText + dataItemC.t + "\n";
        }
      }
    }

    const categories = dataPost?.dataCategories;

    let categoryId = null;
    if (categories) {
      const dataSearch = {
        search: categories?.replace(".", ""),
      };
      const dataCategory = await this.requestCategoryService.filter(dataSearch, {}, 1, 1);
      console.log(dataCategory, "dataCategory");
      if (dataCategory && dataCategory[0]) {
        categoryId = dataCategory[0]?._id?.toString();
      }
    } else {
      categoryId = "64a672f9eee28fcd235ebe01";
    }

    const author = dataPost?.author;
    let email = "";
    if (author) {
      email = this.toSlug(author) + "@gmail.com";
    }

    // console.log(dataText, "dataText");
    let userObject = null;

    if (email) {
      //Create new User
      const dataCreateUser = {
        user_email: email,
        user_login: email,
        display_name: author,
        user_status: 1,
      };
      userObject = await this.userService.findOne({ user_login: email });
      if (!userObject) {
        userObject = await this.userService.create(dataCreateUser);
        await this.handleUpdateUserOption(userObject?._id?.toString());
      }

      console.log(userObject, "userObject");
    }

    let dataRequest = {
      post_category: categoryId,
      post_content: dataText,
      post_title: dataTitle,
      post_language: "en",
      country: "US",
    };

    const dataSlug = this.toSlug(dataTitle);

    if (dataSlug && userObject) {
      dataRequest = { ...dataRequest, ...{ post_slug: dataSlug, user_id: userObject._id.toString() } };
    }

    const dataRequestSearch = await this.requestService.findOne({ post_slug: dataSlug });
    console.log(dataRequestSearch, "dataRequestSearch");
    console.log(dataRequest, "dataRequest");
    if (!dataRequestSearch && dataSlug) {
      //Create
      await this.requestService.create(dataRequest);
    } else {
      if (dataRequestSearch) {
        dataRequest = { ...dataRequest, ...{ _id: dataRequestSearch._id?.toString() } };
        await this.requestService.update(dataRequest);
      }
    }
    // const html = await createAsyncRichTextHtmlResolver(asyncNodeParser).resolveRichTextAsync(dataPost.media?.richtextContent?.document[0]);
    // console.log(html, 'html')
    // let dataJquery = cheerio.load(dataAxios);

    // let dataShReddit = dataJquery("shreddit-post");
    // let dataAuthor = dataShReddit.attr("author");
    // let dataTitle = dataShReddit.attr("post-title");
    // let dataLanguage = dataShReddit.attr("post-language");
    // let dataComment = dataShReddit.attr("content-href");
    // let dataTextContent = dataJquery(".text-neutral-content.text-14").text();
    // dataTextContent = dataTextContent.replace(/\s\s+/g, " ");
    // let dataScores = dataShReddit.attr("score");
    // let commentCount = dataShReddit.attr("comment-count");

    // let dataCommentAxios = await axios
    //   .get(dataComment)
    //   .then((response) => {
    //     return response.data;
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     return null;
    //   });
    const fs = require("fs");

    // // fs.writeFileSync("foo.txt", dataAxios);
    fs.writeFileSync("foo2.txt", dataText);
  }

  async handleUpdateUserOption(userId: string) {
    const dataCreate = {
      user_id: userId,
    };
    const dataUserOption = await this.userOptionService.create(dataCreate);
    if (dataUserOption) {
      const dataUpdate = {
        _id: userId,
        user_option_id: dataUserOption._id.toString(),
      };
      await this.userService.update(dataUpdate);
      return dataUserOption;
    } else {
      return null;
    }
  }

  async handleCategory() {
    const dataCategory = await this.requestCategoryService.filter({}, {}, 1, 100);
    for (const dataCategoryItem of dataCategory) {
      const dataToUpdate = {
        version: 82,
        _id: dataCategoryItem?._id?.toString(),
      };
      console.log(dataToUpdate, "dataToUpdate");
      const dataUpdate = await this.requestCategoryService.update(dataToUpdate);
      console.log(dataUpdate, "dataUpdate");
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
  async getListRequestLike(query: ListRequestLikeDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      const dataToFilter = { ...query };

      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      const dataRequest = await this.requestService.findOne({ _id: query?.request_id });
      if (!dataRequest) {
        throw new ForbiddenException("Request is invalid!");
      }

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn: any = await this.requestLikeService.filterData(dataToFilter, orderByOBject, page, limit);

      let dataChannelPermission = [];
      //Get Data level
      if (dataRequest?.channel_id) {
        const dataUserIds = dataReturn?.map((value) => {
          return value?.user_id?._id?.toString();
        });
        //get permission
        const dataFilterMember = {
          channel_id: dataRequest?.channel_id?.toString(),
          user_ids: dataUserIds,
        };
        dataChannelPermission = await this.channelPermissionService.filterWithoutChannel(
          dataFilterMember,
          {},
          1,
          limit
        );
      }

      if (dataReturn) {
        const dataLikeId = dataReturn?.map((value) => {
          return value?.user_id?._id.toString();
        });
        const dataLikeFilter = {
          user_id: query?.auth_id,
          partner_ids: dataLikeId,
        };
        const dataLikeArray = await this.userFollowService.filter(dataLikeFilter, {}, 1, limit);
        // console.log(dataLikeArray, 'dataLikeArray')
        const dataLikeIds = dataLikeArray?.map((value) => {
          return value?.partner_id?._id?.toString();
        });

        for (const dataReturnItem in dataReturn) {
          const userIdCheck = dataReturn[dataReturnItem]?.user_id?._id?.toString();
          if (dataLikeIds.indexOf(userIdCheck) !== -1) {
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem]?.toObject(), ...{ is_follow: true } };
          } else {
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem]?.toObject(), ...{ is_follow: false } };
          }
          //Check user
          const dataToMerge = dataChannelPermission?.reduce(function (filtered, value) {
            if (value?.user_id?._id?.toString() == dataReturn[dataReturnItem]?.user_id?._id?.toString()) {
              filtered.push({
                ...value?.user_id?.toObject(),
                ...{
                  channel_role: value?.channel_role,
                  coin_number: value?.coin_number,
                  permission: value?.permission,
                  point: value?.point,
                  level_number: value?.level_number,
                },
              });
            }
            return filtered;
          }, []);

          if (dataToMerge && dataToMerge[0]) {
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ user_id: dataToMerge[0] } };
          }
        }
      }
      const dataCount = await this.requestLikeService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async processCategory() {
    try {
      const dataCrawlArray = dataCrawl.split("\n");
      console.log(dataCrawlArray);
      for (const itemData of dataCrawlArray) {
        const dataToCreate = {
          user_id: "642a49eb18acaeada350130e",
          category_language: "en",
          category_content: itemData,
          category_excerpt: "",
          category_parent: "",
          category_slug: this.toSlug(itemData),
          category_status: "",
          category_avatar: null,
          category_title: itemData,
          category_type: "",
          category_view: 0,
        };
        await this.requestCategoryService.create(dataToCreate);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updateRequest() {
    try {
      const dataRequest = await this.requestService.filter({}, {}, 1, 1000);
      for (const dataRequestItem of dataRequest) {
        // console.log(dataRequestItem);
        const userObject = await this.userService.findById(dataRequestItem?.user_id?._id?.toString(), {});
        console.log(userObject?.country, "country");
        const dataToUpdate = {
          _id: dataRequestItem?._id?.toString(),
          country: userObject?.country,
        };
        await this.requestService.update(dataToUpdate);
      }
    } catch (error) {}
  }

  /**
   *
   * @param dataCreate
   * @param res
   * @param req
   * @returns
   */
  async createNewRequestPoll(dataCreate: CreateRequestPollDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const dataQuestion = JSON.parse(dataCreate.question);
      const dataReturn = [];
      const dataToUpdatePoll = [];
      for (const dataQuestionItem of dataQuestion) {
        let dataCreateNew = {
          ...dataCreate,
          ...{ question: dataQuestionItem, created_by: userObject?._id?.toString() },
        };
        if (dataCreate?.request_id) {
          dataCreateNew = { ...dataCreateNew, ...{ request_id: dataCreate?.request_id } };
        }
        const dataPollReturn = await this.requestPollService.create(dataCreateNew);
        dataToUpdatePoll.push(dataPollReturn?._id?.toString());
        dataReturn.push(dataPollReturn);
      }
      if (dataCreate?.request_id) {
        //Update Request
        const dataUpdate = {
          poll_ids: dataToUpdatePoll,
          _id: dataCreate?.request_id,
        };
        await this.requestService.update(dataUpdate);
      }
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param dataCreate
   * @param res
   * @param req
   * @returns
   */
  async unVoteRequestPoll(dataCreate: CreateRequestPollDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject: any = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const dataChoose = await this.requestPollService.findById(dataCreate?.poll_id, {});
      if (dataChoose?.users_choose?.indexOf(userObject?._id) == -1) {
        //Not have
        throw new ForbiddenException("Not Vote");
      }
      if (dataCreate?.poll_id && dataCreate?.request_id) {
        const dataUpdate = {
          _id: dataCreate?.poll_id,
          users_choose: userObject?._id?.toString(),
        };

        //Update
        //Update Number
        const dataUpdateCount = {
          number_choose: -1,
        };
        await this.requestPollService.updateCount({ _id: dataCreate?.poll_id }, dataUpdateCount);
        const dataReturn = await this.requestPollService.updateArray(dataUpdate, true);

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new ForbiddenException("Data invalid!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param dataCreate
   * @param res
   * @param req
   * @returns
   */
  async voteRequestPoll(dataCreate: CreateRequestPollDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject: any = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      console.log(dataCreate, "dataCreate");

      if (dataCreate?.poll_id && dataCreate?.request_id) {
        //ReUpdate
        const dataPollArray = await this.requestPollService.filter({ request_id: dataCreate?.request_id }, {}, 1, 1000);
        for (const dataItemPool of dataPollArray) {
          if (dataItemPool?.users_choose?.indexOf(userObject?._id) !== -1) {
            //Update
            const dataUpdateCount = {
              number_choose: -1,
            };
            await this.requestPollService.updateCount({ _id: dataItemPool?._id }, dataUpdateCount);
            const dataUpdateNew = {
              _id: dataItemPool?._id?.toString(),
              users_choose: userObject?._id?.toString(),
            };
            await this.requestPollService.updateArray(dataUpdateNew, true);
          }
        }
        const dataUpdate = {
          _id: dataCreate?.poll_id,
          users_choose: userObject?._id?.toString(),
        };

        //Update
        //Update Number
        const dataUpdateCount = {
          number_choose: 1,
        };
        await this.requestPollService.updateCount({ _id: dataCreate?.poll_id }, dataUpdateCount);

        const dataReturn = await this.requestPollService.updateArray(dataUpdate);

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new ForbiddenException("Data invalid!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param dataCreate
   * @param res
   * @param req
   * @returns
   */
  async handleGetListVote(query: FilterListVote, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000 || !query.limit) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;

      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      const dataVote = await this.requestPollService.findOneWithLimit(query, limit, page, orderByOBject);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataVote);
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
  async getListRequest(query: ListRequestDto, res: Response, req: ExpressRequestDto) {
    try {
      // console.log(req.headers, "req.headers");
      if (Number(query.limit) > 1000 || !query.limit) {
        query.limit = 1000;
      }
      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;

      let orderByOBject = {};
      if (query.order_by && (query.order_type == "time" || !query?.order_type)) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      if (query.order_by && query.order_type == "most_popular") {
        orderByOBject = { ...orderByOBject, ...{ popular_number: query.order_by } };
      }

      if (query.order_by && query.order_type == "most_upvote") {
        orderByOBject = { ...orderByOBject, ...{ vote_number: "DESC" } };
      }

      if (query.order_by && query.order_type == "most_downvote") {
        orderByOBject = { ...orderByOBject, ...{ vote_number: "ASC" } };
      }

      if (query.order_by && query.order_type == "trending") {
        orderByOBject = { ...orderByOBject, ...{ trending_number: query.order_by } };
      }

      // let dataSession = await this.handleSession(req);
      // if (dataSession && dataSession?.country) {
      //   query = { ...query, ...{ country: dataSession?.country } };
      // }

      const dataToFilter = { ...query, ...{ channel_id: req?.channel_id } };

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.requestService.filter(dataToFilter, orderByOBject, page, limit);

      const dataNotification = [];

      if (query?.auth_id) {
        const dataAuth = await this.userService.findById(query?.auth_id, {});
        if (dataAuth && dataAuth?.notification_request) {
          for (const dataItemNotification of dataAuth?.notification_request) {
            dataNotification.push(dataItemNotification?.toString());
          }
        }
      }

      if (dataReturn) {
        const dataIds = [];
        for (const itemReturn of dataReturn) {
          dataIds.push(itemReturn?._id);
        }
        const dataLikeFilter = {
          user_id: query?.auth_id ? query?.auth_id : null,
          request_ids: dataIds,
        };
        let dataLikeArray = [];
        let dataDisLikeArray = [];
        if (query?.auth_id) {
          dataLikeArray = await this.requestLikeService.filter(dataLikeFilter, {}, 1, limit);
          dataDisLikeArray = await this.requestDisLikeService.filter(dataLikeFilter, {}, 1, limit);
        }
        // console.log(dataLikeArray, 'dataLikeArray')

        const dataLikeId = [];
        for (const dataLikeItem of dataLikeArray) {
          dataLikeId.push(dataLikeItem?.request_id.toString());
        }
        for (const dataIndexItem in dataReturn) {
          dataReturn[dataIndexItem] = { ...dataReturn[dataIndexItem]?.toObject() };
        }

        const dataDisLikeId = [];
        for (const dataDisLikeItem of dataDisLikeArray) {
          dataDisLikeId.push(dataDisLikeItem?.request_id.toString());
        }

        let dataChannelPermission = [];
        //Get Data level
        if (query?.channel_id) {
          const dataUserIds = dataReturn?.map((value) => {
            return value?.user_id?._id?.toString();
          });
          //get permission
          const dataFilterMember = {
            channel_id: query?.channel_id,
            user_ids: dataUserIds,
          };
          dataChannelPermission = await this.channelPermissionService.filterWithoutChannel(
            dataFilterMember,
            {},
            1,
            limit
          );
        }
        for (const dataReturnItem in dataReturn) {
          const requestId = dataReturn[dataReturnItem]?._id?.toString();

          if (dataNotification.indexOf(requestId) !== -1) {
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ is_notification: true } };
          } else {
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ is_notification: false } };
          }
          if (dataLikeId.indexOf(requestId) !== -1) {
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ is_like: true } };
          } else {
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ is_like: false } };
          }

          if (dataDisLikeId.indexOf(requestId) !== -1) {
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ is_dislike: true } };
          } else {
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ is_dislike: false } };
          }

          //Check user
          const dataToMerge = dataChannelPermission?.reduce(function (filtered, value) {
            if (value?.user_id?._id?.toString() == dataReturn[dataReturnItem]?.user_id?._id?.toString()) {
              filtered.push({
                ...value?.user_id?.toObject(),
                ...{
                  channel_role: value?.channel_role,
                  coin_number: value?.coin_number,
                  permission: value?.permission,
                  point: value?.point,
                  level_number: value?.level_number,
                },
              });
            }
            return filtered;
          }, []);

          if (dataToMerge && dataToMerge[0]) {
            dataReturn[dataReturnItem] = { ...dataReturn[dataReturnItem], ...{ user_id: dataToMerge[0] } };
          }
        }
      }

      const dataCount = await this.requestService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      console.log(error, "error");
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param res
   */
  async handleSession(req: ExpressRequestDto) {
    try {
      const authCodeHeader = req?.headers;
      let authCodeString: string = "";
      if (authCodeHeader && authCodeHeader["x-authorization"]) {
        authCodeString = authCodeHeader["x-authorization"]?.toString();
      }
      if (authCodeHeader && authCodeHeader["authorization"]) {
        authCodeString = authCodeHeader["authorization"].replace("Bearer ", "");
      }

      try {
        const hashPassword = process.env.HASH_PASSWORD;
        const { data, exp } = (await new JwtService().decode(authCodeString)) as DecodeUserToken;
        if (!data || !exp) {
          return null;
        }
        let dataSession: any = null;
        if (data?.session) {
          //Data User session
          dataSession = await this.userService.findById(data?._id?.toString(), {});
        } else {
          const dataAnonymousSession = await this.userAnonymousSession.findById(data?._id, {});
          const deviceId = dataAnonymousSession?.device_id;
          dataSession = await this.userAnonymousService.findOne({ device_id: deviceId });
        }
        return dataSession;
      } catch (error) {
        // console.log(error);
        return null;
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
  async createNewRequest(createRequestData: CreateRequestDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const authCode = req?.auth_code;
      // console.log(authCode, ' 1205 authCode')

      const dataFilterPermission = {
        channel_id: createRequestData.channel_id,
        user_id: userObject?._id?.toString(),
      };
      const channel = await this.channelService.findById(createRequestData.channel_id);
      const dataPermission = await this.channelPermissionService.findOne(dataFilterPermission);
      const channelMentor = await this.channelPermissionService.filter(
        {
          channel_id: createRequestData.channel_id,
          channel_role: "mentor",
        },
        {},
        1,
        99
      );
      const channelMentorId = channelMentor.map((x) => {
        return x?.user_id?._id.toString();
      });
      if (dataPermission.channel_role === "user") {
        if (Boolean(channel.need_approval) === true) {
          createRequestData.post_status = "pending";
          setTimeout(async () => {
            await this.notificationHelper.sendNotification({
              user_id: channelMentorId,
              channel_id: createRequestData.channel_id,
              title: `BÀI ĐĂNG CẦN PHÊ DUYỆT`,
              path: `/r/post/approval-list`,
              request_id: null,
              content: () => {
                return `${userObject?.display_name} vừa đăng bài cần phê duyệt`;
              },
              send_user_id: dataPermission?.user_id?._id.toString(),
            });
          }, 500);
        } else {
          createRequestData.post_status = "publish";
        }
      } else {
        createRequestData.post_status = "publish";
      }

      // console.log(dataPermission, "dataPermission");
      if (!dataPermission) {
        throw new ForbiddenException("You not have permission to this action!");
      }
      const channelName = dataPermission?.channel_id;
      const dataSlug = this.toSlug(createRequestData.post_title);
      createRequestData = { ...createRequestData, ...{ post_slug: dataSlug, user_id: userObject._id.toString() } };

      const userCountry = userObject?.country;
      createRequestData = { ...createRequestData, ...{ country: userCountry } };

      if (this.validateJson(createRequestData?.attach_files)) {
        createRequestData = {
          ...createRequestData,
          ...{
            attach_files: JSON.parse(createRequestData?.attach_files),
          },
        };
      } else {
        createRequestData = {
          ...createRequestData,
          ...{
            attach_files: [],
          },
        };
      }

      if (this.validateJson(createRequestData?.poll_ids)) {
        createRequestData = {
          ...createRequestData,
          ...{
            poll_ids: JSON.parse(createRequestData?.poll_ids),
          },
        };
      } else {
        createRequestData = {
          ...createRequestData,
          ...{
            poll_ids: [],
          },
        };
      }

      createRequestData = { ...createRequestData, ...{ popular_number: 10, trending_number: 10 } };

      const dataCreate: any = await this.requestService.create(createRequestData);
      const dataReturn = await this.requestService.findById(dataCreate?._id?.toString());

      //Update Notification
      const dataUpdateNotification = {
        _id: userObject?._id?.toString(),
        notification_request: dataCreate?._id?.toString(),
      };
      await this.userService.updateArray(dataUpdateNotification, false);

      //Update
      const dataChannelPoint = dataPermission?.channel_id?.point_data;
      //Check point
      let dataPoint = 5;
      if (dataChannelPoint && dataChannelPoint?.length) {
        for (const dataChannelPointItem of dataChannelPoint) {
          if (dataChannelPointItem?.key == "post_new") {
            dataPoint = parseInt(dataChannelPointItem?.value);
          }
        }
      }

      //Update user level
      //Update Count
      if (dataReturn?.post_status === "publish") {
        await this.channelPermissionService.updateCount(
          { _id: dataPermission?._id?.toString(), channel_id: dataPermission?.channel_id?._id },
          { point: dataPoint, point_month: dataPoint, point_week: dataPoint },
          authCode,
          {
            entity_id: dataCreate?._id?.toString(),
            entity_type: "post",
            content: dataCreate?.post_title,
            point_number: dataPoint,
            user_id: userObject?._id.toString(),
          },
          "post_new"
        );
      }

      //Update Notification
      setTimeout(async () => {
        //Check is Mentor
        if (dataPermission?.channel_role == "mentor") {
          await this.handleSendNotificationToAll(userObject, dataReturn, authCode, channelName, dataPermission, req);
        }
      }, 10000);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      console.log(error, "error");
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param fromUser
   * @param dataRequest
   * @returns
   */
  async handleSendNotificationToAll(
    fromUser: User,
    dataRequest: RequestNew,
    authCode: string = "",
    channelObject: any = {},
    dataPermission: any = {},
    req: ExpressRequestDto
  ) {
    try {
      let notificationTitle = fromUser.display_name ? fromUser.display_name : fromUser.user_login;
      let chatContentToSend = `${notificationTitle} đã đăng: ${dataRequest.post_title}`;
      if (chatContentToSend && chatContentToSend.length >= 255) {
        chatContentToSend = chatContentToSend.substring(0, 250) + "...";
      }
      notificationTitle = notificationTitle + ` đăng bài mới!`;

      if (notificationTitle && notificationTitle.length >= 70) {
        notificationTitle = notificationTitle.substring(0, 68) + "...";
      }
      const userIdArray = [];
      const channelId = dataRequest?.channel_id?.toString();
      const emailArray = [];
      for (let itemPage: number = 1; itemPage <= 10; itemPage++) {
        const allUser = await this.channelPermissionService.filter({ channel_id: channelId }, {}, itemPage, 1000);
        for (const itemUser of allUser) {
          if (itemUser?.user_id?._id) {
            userIdArray.push(itemUser?.user_id?._id?.toString());
            const userEmail = itemUser?.user_id?.user_email;
            if (userEmail) {
              emailArray.push(itemUser?.user_id);
            }
          }
        }
        if (!allUser?.length) {
          break;
        }
      }

      if (dataPermission?.channel_role == "mentor") {
        //Update Email
        const dataFirestore = getFirestore();

        for (const emailItem of emailArray) {
          //Let dataToUpdate
          const dataToUpdate = {
            brand_name: "Gamifa",
            channel: channelObject?.name?.toString(),
            post_name: dataRequest.post_title,
            //@ts-ignore
            post_image: dataRequest?.attach_files[0]?.media_url || "",
            email: emailItem?.user_email,
            fullname: emailItem.display_name,
            user_id: fromUser?._id?.toString(),
            post_url: (channelObject?.domain || "https://gamifa.vn") + "/v/post/" + dataRequest?.post_slug,
            event_name: "send_mail_notification",
            is_send_email: false,
          };

          //Update
          const dataUserStore = dataFirestore.collection("Users");
          await dataUserStore
            .add(dataToUpdate)
            .then(() => {
              console.log("User added!");
            })
            .catch((error) => {
              console.log(error);
            });
        }

        if (userIdArray && userIdArray?.length) {
          const dataToSendNotification = {
            request_id: dataRequest?._id?.toString(),
            path: "/v/post/",
            data_id: dataRequest?.post_slug?.toString(),
          };
          const notificationContent = chatContentToSend;
          const dataNotification = {
            createdBy: fromUser._id.toString(),
            user_id: userIdArray,
            channel_id: req?.channel_id,
            title: notificationTitle?.toString(),
            content: notificationContent,
            param: JSON.stringify(dataToSendNotification),
            request_id: dataRequest?._id?.toString(),
            type_action: "link",
            router: "NAVIGATION_LIST_NOTIFICATIONS_SCREEN",
            click_action: "",
            image: "",
            channel: "user",
          };
          await this.notificationHelper.handleSendNotification(dataNotification, authCode);
        }
      }

      return true;
    } catch (error) {
      console.log(error, "error");
      return false;
    }
  }

  /**
   * @author Tony Vu
   * @param fromUser
   * @param toUser
   * @param chatContent
   * @param orderPnr
   * @returns
   */
  async handleSendNotification(
    fromUser: User,
    dataRequest: RequestNew,
    dataComment: RequestComment,
    authCode: string,
    channelObject: Channel,
    req: ExpressRequestDto
  ) {
    try {
      let notificationTitle = fromUser.display_name ? fromUser.display_name : fromUser.user_login;
      let chatContentToSend = `${notificationTitle} đã bình luận trong bài viết: ${dataComment.content}`;
      const chatContentRaw = `${notificationTitle} đã bình luận trong bài viết: ${dataComment.content}`;
      if (chatContentToSend && chatContentToSend.length >= 255) {
        chatContentToSend = chatContentToSend.substring(0, 250) + "...";
      }
      notificationTitle = notificationTitle + ` đã bình luận trong "${dataRequest?.post_title}`;

      if (notificationTitle && notificationTitle.length >= 70) {
        notificationTitle = notificationTitle.substring(0, 68) + '..."';
      } else {
        notificationTitle = notificationTitle + '"';
      }

      const userIdArray = [];
      const emailArray = [];

      const dataUser = await this.userService.filter(
        { notification_request: dataRequest?._id?.toString() },
        {},
        1,
        1000
      );
      for (const userItem of dataUser) {
        if (userItem?._id?.toString() !== fromUser?._id?.toString()) {
          userIdArray.push(userItem._id.toString());
          emailArray.push(userItem);
        }
      }

      //Update Email
      const dataFirestore = getFirestore();

      for (const emailItem of emailArray) {
        //Let dataToUpdate
        const dataToUpdate = {
          brand_name: "Gamifa",
          channel: channelObject?.name?.toString(),
          content: chatContentRaw,
          post_name: dataRequest.post_title,
          //@ts-ignore
          post_image: dataRequest?.attach_files[0]?.media_url || "",
          email: emailItem?.user_email,
          fullname: emailItem.display_name,
          user_id: fromUser?._id?.toString(),
          post_url: (channelObject?.domain || "https://gamifa.vn") + "/v/post/" + dataRequest?.post_slug,
          event_name: "reply_notification",
          is_send_email: false,
        };

        //Update
        const dataUserStore = dataFirestore.collection("Users");
        await dataUserStore
          .add(dataToUpdate)
          .then(() => {
            console.log("User added!");
          })
          .catch((error) => {
            console.log(error);
          });
      }

      if (userIdArray && userIdArray?.length) {
        const dataToSendNotification = {
          request_id: dataRequest?._id?.toString(),
          path: "/v/post/",
          data_id: dataRequest?.post_slug?.toString(),
        };
        const notificationContent = chatContentToSend;
        const dataNotification = {
          createdBy: fromUser._id.toString(),
          user_id: userIdArray,
          channel_id: req?.channel_id,
          title: notificationTitle?.toString(),
          content: notificationContent,
          param: JSON.stringify(dataToSendNotification),
          request_id: dataRequest?._id?.toString(),
          type_action: "link",
          router: "NAVIGATION_LIST_NOTIFICATIONS_SCREEN",
          click_action: "",
          image: "",
          channel: "user",
        };
        await this.notificationHelper.handleSendNotification(dataNotification, authCode);
      }

      return true;
    } catch (error) {
      return false;
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
  async createNewComment(createRequestData: CreateRequestCommentDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject: any = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const authCode = req?.auth_code;

      const dataRequestObject = await this.requestService.findById(createRequestData?.request_id);

      const dataCountUserFilter = {
        request_id: createRequestData?.request_id,
        user_id: userObject?._id?.toString(),
      };
      const dataCountUser = await this.requestCommentService.count(dataCountUserFilter);
      if (!dataRequestObject) {
        throw new ForbiddenException("Request not exist!");
      }

      const dataFilterPermission = {
        channel_id: dataRequestObject.channel_id?.toString(),
        user_id: userObject?._id?.toString(),
      };
      const dataPermission = await this.channelPermissionService.findOne(dataFilterPermission);
      if (!dataPermission) {
        throw new ForbiddenException("You not have permission to this action!");
      }

      createRequestData = { ...createRequestData, ...{ user_id: userObject._id.toString() } };

      let dataCreate: any = await this.requestCommentService.create(createRequestData);

      dataCreate = { ...dataCreate?.toObject(), ...{ user_id: userObject } };
      if (createRequestData?.parent_id) {
        const dataUpdate = {
          _id: createRequestData?.parent_id,
          child: dataCreate?._id,
        };
        await this.requestCommentService.updateArray(dataUpdate, false);
      }

      //Update Count
      const dataUpdateCount = {
        _id: createRequestData?.request_id,
      };
      const dataUpdate = {
        comment_number: 1,
      };
      const dataRequest = await this.requestService.updateCount(dataUpdateCount, dataUpdate);

      //Update child

      if (createRequestData?.parent_id) {
        const dataToUpdateArray = {
          child_number: 1,
        };
        await this.requestCommentService.updateCount({ _id: createRequestData?.parent_id }, dataToUpdateArray);
      }

      //Update Notification
      const dataUpdateNotification = {
        _id: userObject?._id?.toString(),
        notification_request: createRequestData?.request_id,
      };
      await this.userService.updateArray(dataUpdateNotification, false);

      setTimeout(async () => {
        await this.handleSendNotification(
          userObject,
          dataRequest,
          dataCreate,
          authCode,
          dataPermission?.channel_id,
          req
        );
      }, 500);

      if (!dataCountUser) {
        //Update
        const dataChannelPoint = dataPermission?.channel_id?.point_data;
        //Check point
        let dataPoint = 2;
        if (dataChannelPoint && dataChannelPoint?.length) {
          for (const dataChannelPointItem of dataChannelPoint) {
            if (dataChannelPointItem?.key == "comment") {
              dataPoint = parseInt(dataChannelPointItem?.value);
            }
          }
        }

        //Update user level
        //Update Count
        await this.channelPermissionService.updateCount(
          { _id: dataPermission?._id?.toString(), channel_id: req.channel_id.toString() },
          { point: dataPoint, point_month: dataPoint, point_week: dataPoint },
          authCode,
          {
            entity_id: createRequestData?.request_id,
            entity_type: "create_comment",
            content: dataRequestObject?.post_title,
            point_number: dataPoint,
            user_id: userObject?._id?.toString(),
          },
          "comment"
        );
      }

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
   * @param dataCreate
   * @param res
   * @param req
   */
  async createLike(dataCreate: CreateRequestLikeDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const authCode = req?.auth_code;

      const dataRequestObject = await this.requestService.findById(dataCreate?.request_id);
      if (!dataRequestObject) {
        throw new ForbiddenException("Request not exist!");
      }

      const dataFilterPermission = {
        channel_id: dataRequestObject.channel_id?.toString(),
        user_id: userObject?._id?.toString(),
      };
      const dataPermission = await this.channelPermissionService.findOne(dataFilterPermission);
      if (!dataPermission) {
        throw new ForbiddenException("You not have permission to this action!");
      }

      const dataToCreate = {
        user_id: userObject?._id,
        request_id: dataCreate?.request_id,
      };

      //Check
      const dataCheck = await this.requestLikeService.findOne(dataToCreate);

      if (dataCheck) {
        let dataRemove: any = await this.requestLikeService.removeOne(dataToCreate);
        const dataFilter = {
          _id: dataCreate?.request_id,
        };
        //Like Number
        const dataLikeNumber = await this.requestService.updateCount(dataFilter, { like_number: -1, vote_number: -1 });
        dataRemove = dataRemove?.toObject();
        dataRemove = {
          ...dataRemove,
          ...{ is_like: false, like_number: dataLikeNumber?.like_number, vote_number: dataLikeNumber?.vote_number },
        };

        //Un upvote
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataRemove);
      } else {
        //Remove Dislike
        const dataRemove = await this.requestDisLikeService.removeOne(dataToCreate);
        let dataReturn: any = await this.requestLikeService.create(dataToCreate);

        //Update like
        let dataUpdate = {
          like_number: 1,
          vote_number: 1,
        };

        if (dataRemove) {
          dataUpdate = { ...dataUpdate, ...{ vote_number: 2, dislike_number: -1 } };
        }
        const dataFilter = {
          _id: dataCreate?.request_id,
        };

        const dataLikeNumber = await this.requestService.updateCount(dataFilter, dataUpdate);
        dataReturn = dataReturn?.toObject();
        dataReturn = {
          ...dataReturn,
          ...{ is_like: true, like_number: dataLikeNumber?.like_number, vote_number: dataLikeNumber?.vote_number },
        };

        if (!dataRemove) {
          //Update
          const dataChannelPoint = dataPermission?.channel_id?.point_data;
          //Check point
          let dataPoint = 1;
          if (dataChannelPoint && dataChannelPoint?.length) {
            for (const dataChannelPointItem of dataChannelPoint) {
              if (dataChannelPointItem?.key == "like_post") {
                dataPoint = parseInt(dataChannelPointItem?.value);
              }
            }
          }
          //Update user level
          //Update Count
          await this.channelPermissionService.updateCount(
            { _id: dataPermission?._id?.toString(), channel_id: req.channel_id.toString() },
            { point: dataPoint, point_month: dataPoint, point_week: dataPoint },
            authCode,
            {
              entity_id: dataCreate?.request_id,
              entity_type: "request",
              content: dataRequestObject?.post_title,
              point_number: dataPoint,
              user_id: userObject?._id?.toString(),
            },
            "like_post"
          );
        }

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param dataCreate
   * @param res
   * @param req
   */
  async createDislike(dataCreate: CreateRequestLikeDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const dataToCreate = {
        user_id: userObject?._id,
        request_id: dataCreate?.request_id,
      };

      //Check
      const dataCheck = await this.requestDisLikeService.findOne(dataToCreate);

      if (dataCheck) {
        const dataRemove = await this.requestDisLikeService.removeOne(dataToCreate);
        const dataFilter = {
          _id: dataCreate?.request_id,
        };
        await this.requestService.updateCount(dataFilter, { dislike_number: -1, vote_number: 1 });
        //Un upvote
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataRemove);
      } else {
        const dataReturn = await this.requestDisLikeService.create(dataToCreate);
        const dataRemove = await this.requestLikeService.removeOne(dataToCreate);
        //Update like
        let dataUpdate = {
          vote_number: -1,
          dislike_number: 1,
        };
        const dataFilter = {
          _id: dataCreate?.request_id,
        };

        if (dataRemove) {
          dataUpdate = { ...dataUpdate, ...{ like_number: -1, vote_number: -2 } };
        }
        await this.requestService.updateCount(dataFilter, dataUpdate);

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param dataCreate
   * @param res
   * @param req
   */
  async createLikeComment(dataCreate: CreateRequestLikeDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject: any = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const authCode = req?.auth_code;

      //CheckComment
      const dataComment = await this.requestCommentService.findOne({ _id: dataCreate?.comment_id });
      const requestId = dataComment?.request_id?.toString();

      const dataRequestObject = await this.requestService.findById(requestId);
      if (!dataRequestObject) {
        throw new ForbiddenException("Request not exist!");
      }

      const dataFilterPermission = {
        channel_id: dataRequestObject.channel_id?.toString(),
        user_id: userObject?._id?.toString(),
      };
      const dataPermission = await this.channelPermissionService.findOne(dataFilterPermission);
      if (!dataPermission) {
        throw new ForbiddenException("You not have permission to this action!");
      }

      let isLike = false;
      let isRemove = false;
      let isDownVoteBefore = false;
      let dataReturn: any = null;
      if (dataComment?.up_vote) {
        if (dataComment?.up_vote.indexOf(userObject?._id) !== -1) {
          isRemove = true;
        }
      }

      if (dataComment?.down_vote) {
        if (dataComment?.down_vote.indexOf(userObject?._id) !== -1) {
          isDownVoteBefore = true;
        }
      }
      //remove or add Up-vote
      const dataUpdateDownVote = {
        _id: dataCreate?.comment_id,
        up_vote: userObject?._id,
      };
      dataReturn = await this.requestCommentService.updateArray(dataUpdateDownVote, isRemove);

      if (isDownVoteBefore) {
        //Remove Downvote
        const dataUpdateUpVote = {
          _id: dataCreate?.comment_id,
          down_vote: userObject?._id,
        };
        await this.requestCommentService.updateArray(dataUpdateUpVote, true);
      } else {
        isLike = true;
      }

      //Update Number
      let dataUpdateNumber = 0;
      if (isDownVoteBefore) {
        dataUpdateNumber = dataUpdateNumber + 1;
      }
      if (isRemove) {
        dataUpdateNumber = dataUpdateNumber - 1;
      } else {
        dataUpdateNumber = dataUpdateNumber + 1;
      }
      await this.requestCommentService.updateCount({ _id: dataCreate?.comment_id }, { vote_number: dataUpdateNumber });
      dataReturn = { ...dataReturn, ...{ is_like: isLike } };

      if (isLike) {
        //Update
        const dataChannelPoint = dataPermission?.channel_id?.point_data;
        //Check point
        let dataPoint = 1;
        if (dataChannelPoint && dataChannelPoint?.length) {
          for (const dataChannelPointItem of dataChannelPoint) {
            if (dataChannelPointItem?.key == "like_comment") {
              dataPoint = parseInt(dataChannelPointItem?.value);
            }
          }
        }

        //Update user level
        //Update Count
        await this.channelPermissionService.updateCount(
          { _id: dataPermission?._id?.toString(), channel_id: req?.channel_id },
          { point: dataPoint, point_month: dataPoint, point_week: dataPoint },
          authCode,
          {
            entity_id: dataCreate?.comment_id,
            entity_type: "like_comment",
            content: dataRequestObject?.post_title,
            point_number: dataPoint,
            user_id: userObject?._id?.toString(),
          },
          "like_comment"
        );
      }
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param dataCreate
   * @param res
   * @param req
   */
  async createDislikeComment(dataCreate: CreateRequestLikeDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject: any = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      //CheckComment
      const dataComment = await this.requestCommentService.findOne({ _id: dataCreate?.comment_id });

      let isRemove = false;
      let isUpvoteBefore = false;
      let dataReturn: any = null;

      if (dataComment?.down_vote) {
        if (dataComment?.down_vote.indexOf(userObject?._id) !== -1) {
          isRemove = true;
        }
      }

      if (dataComment?.up_vote) {
        if (dataComment?.up_vote.indexOf(userObject?._id) !== -1) {
          isUpvoteBefore = true;
        }
      }
      //Remove or add Downvote
      const dataUpdateDownVote = {
        _id: dataCreate?.comment_id,
        down_vote: userObject?._id,
      };
      dataReturn = await this.requestCommentService.updateArray(dataUpdateDownVote, isRemove);

      //Update vote Number
      let dataUpdateNumber = 0;
      if (isUpvoteBefore) {
        dataUpdateNumber = dataUpdateNumber - 1;
      }
      if (isRemove) {
        dataUpdateNumber = dataUpdateNumber + 1;
      } else {
        dataUpdateNumber = dataUpdateNumber - 1;
      }

      if (isUpvoteBefore) {
        //Remove Downvote
        const dataUpdateUpVote = {
          _id: dataCreate?.comment_id,
          up_vote: userObject?._id,
        };
        await this.requestCommentService.updateArray(dataUpdateUpVote, true);
      }

      await this.requestCommentService.updateCount({ _id: dataCreate?.comment_id }, { vote_number: dataUpdateNumber });

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
  async createCategory(createRequestData: CreateRequestCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const dataSlug = this.toSlug(createRequestData.category_title?.toString());
      createRequestData = { ...createRequestData, ...{ category_slug: dataSlug, user_id: userObject._id.toString() } };

      const dataCreate = await this.requestCategoryService.create(createRequestData);
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
   * @param channelId
   */
  async processCategoryWhenCreateChannel(channelId: string) {
    try {
      const allCagegory: any = await this.requestCategoryService.filter(
        { channel_id: process.env.DEFAULT_CHANNEL },
        {},
        1,
        100
      );
      for (const categoryItem of allCagegory) {
        // console.log(categoryItem, 'categoryItem')
        const categoryToAdd = {
          ...categoryItem?.toObject(),
          ...{ channel_id: channelId, category_avatar: categoryItem?.category_avatar?._id?.toString() },
        };
        delete categoryToAdd?._id;
        delete categoryToAdd?.user_id;
        delete categoryToAdd?.__v;
        await this.requestCategoryService.create(categoryToAdd);
      }
    } catch (error) {
      console.log(error);
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
  async getListRequestComment(query: ListRequestCommentDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000 || !query.limit) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      let orderByOBject = {};

      const dataToFilter = { ...query };

      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      const dataRequest = await this.requestService.findOne({ _id: query?.request_id });
      if (!dataRequest) {
        throw new ForbiddenException("Request is invalid");
      }

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturnBefore = await this.requestCommentService.filter(dataToFilter, orderByOBject, page, limit);
      const dataReturn: any = [];
      for (const itemBefore of dataReturnBefore) {
        dataReturn.push(itemBefore?.toObject());
      }
      const dataCount = await this.requestCommentService.count(dataToFilter);
      const dataReturnFinal = [];

      let dataPermissionArrayObject = [];
      if (query?.auth_id && dataRequest?.channel_id) {
        const dataUserIds = dataReturn?.map((value) => {
          return value?.user_id?._id?.toString();
        });

        const dataToFilterPermission = {
          user_ids: dataUserIds,
          channel_id: dataRequest?.channel_id?.toString(),
        };
        dataPermissionArrayObject = await this.channelPermissionService.filter(dataToFilterPermission, {}, 1, limit);
      }

      for (const dataItem of dataReturn) {
        let isLike = false;
        let isDislike = false;
        const dataDisLike = dataItem?.down_vote;
        const dataLike = dataItem?.up_vote;

        const dataDisLikeArray = [];
        for (const itemDislike of dataDisLike) {
          dataDisLikeArray.push(itemDislike?.toString());
        }
        if (dataDisLikeArray.indexOf(query?.auth_id) !== -1) {
          isDislike = true;
        }

        const dataLikeArray = [];
        for (const itemLike of dataLike) {
          dataLikeArray.push(itemLike?.toString());
        }
        if (dataLikeArray.indexOf(query?.auth_id) !== -1) {
          isLike = true;
        }
        const dataChild = [];
        if (dataItem && dataItem?.child) {
          for (const dataChildIndex in dataItem?.child) {
            let dataItemChild = dataItem?.child[dataChildIndex];

            let isUpvoteChild = false;
            const dataUpvoteChild = dataItemChild?.up_vote;
            const dataUpvoteChildArray = [];
            for (const itemDislikeChild of dataUpvoteChild) {
              dataUpvoteChildArray.push(itemDislikeChild?.toString());
            }
            if (dataUpvoteChildArray.indexOf(query?.auth_id) !== -1) {
              isUpvoteChild = true;
            }

            let isDownVoteChild = false;
            const dataDownVoteChild = dataItemChild?.down_vote;
            const dataDownvoteChildArray = [];
            for (const itemDislikeChild of dataDownVoteChild) {
              dataDownvoteChildArray.push(itemDislikeChild?.toString());
            }
            if (dataDownvoteChildArray.indexOf(query?.auth_id) !== -1) {
              isDownVoteChild = true;
            }
            dataItemChild = {
              ...dataItem?.child[dataChildIndex],
              ...{ is_like: isUpvoteChild, is_dislike: isDownVoteChild },
            };
            dataChild.push(dataItemChild);
          }
        }

        const dataUserObject = dataPermissionArrayObject?.map((value) => {
          if (value?.user_id?._id?.toString() == dataItem?.user_id?._id?.toString()) {
            return value;
          }
        });

        let dataToPush = { ...dataItem, ...{ is_like: isLike, is_dislike: isDislike, child: dataChild } };

        const dataToMerge = dataPermissionArrayObject?.reduce(function (filtered, value) {
          if (value?.user_id?._id?.toString() == dataToPush?.user_id?._id?.toString()) {
            filtered.push({
              ...value?.user_id?.toObject(),
              ...{
                channel_role: value?.channel_role,
                coin_number: value?.coin_number,
                permission: value?.permission,
                point: value?.point,
                level_number: value?.level_number,
              },
            });
          }
          return filtered;
        }, []);

        if (dataToMerge && dataToMerge[0]) {
          dataToPush = { ...dataToPush, ...{ user_id: dataToMerge[0] } };
        }
        dataReturnFinal.push(dataToPush);
      }
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturnFinal);
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
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleGetDetailRequest(id: string, query: ListRequestDto, res: Response, req: ExpressRequestDto) {
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

      let dataReturn: any = await this.requestService.findOne(dataToFilter);
      dataReturn = { ...dataReturn?.toObject() };

      let getDataLike = null;
      let dataDisLike = null;
      if (query?.auth_id) {
        const dataToFilterLike = {
          user_id: query?.auth_id,
          request_id: dataReturn?._id?.toString(),
        };
        getDataLike = await this.requestLikeService.findOne(dataToFilterLike);
        dataDisLike = await this.requestDisLikeService.findOne(dataToFilterLike);
      }

      if (getDataLike) {
        dataReturn = { ...dataReturn, ...{ is_like: true } };
      } else {
        dataReturn = { ...dataReturn, ...{ is_like: false } };
      }

      if (dataDisLike) {
        dataReturn = { ...dataReturn, ...{ is_dislike: true } };
      } else {
        dataReturn = { ...dataReturn, ...{ is_dislike: false } };
      }

      const dataNotification = [];

      if (query?.auth_id) {
        const dataAuth = await this.userService.findById(query?.auth_id, {});
        if (dataAuth && dataAuth?.notification_request) {
          for (const dataItemNotification of dataAuth?.notification_request) {
            dataNotification.push(dataItemNotification?.toString());
          }
        }
      }

      if (dataNotification?.indexOf(dataReturn?._id?.toString()) !== -1) {
        dataReturn = { ...dataReturn, ...{ is_notification: true } };
      } else {
        dataReturn = { ...dataReturn, ...{ is_notification: false } };
      }

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
  async handleGetDetailCategory(id: string, res: Response, req: ExpressRequestDto) {
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
        dataToFilter = { ...dataToFilter, ...{ category_slug: id.toString() } };
      }
      const dataReturn = await this.requestCategoryService.findOne(dataToFilter);
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
  async handleGetDetailComment(id: string, res: Response, req: ExpressRequestDto) {
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
      const dataReturn = await this.requestCommentService.findOne(dataToFilter);
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
  async handleUpdateRequestByAdmin(dataUpdate: UpdateRequestDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = userObject._id.toString();
      const requestObject = await this.requestService.findById(dataUpdate?._id?.toString());
      const channelId = requestObject.channel_id;
      const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      let canPin = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("comment/delete") !== -1)
      ) {
        havePermission = true;
        canPin = true;
      }
      if (requestObject?.user_id?._id?.toString() == userId) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "request/update")) {
        havePermission = true;
      }

      if (!canPin) {
        delete dataUpdate?.is_pin;
      }

      if (!havePermission) {
        throw new BadRequestException("You haven't permission for this Action!");
      }

      if (dataUpdate.public_album) {
        dataUpdate = { ...dataUpdate, ...{ public_album: JSON.parse(dataUpdate.public_album) } };
      }
      if (dataUpdate.attach_files) {
        dataUpdate = { ...dataUpdate, ...{ attach_files: JSON.parse(dataUpdate.attach_files) } };
      }
      if (dataUpdate.poll_ids) {
        dataUpdate = { ...dataUpdate, ...{ poll_ids: JSON.parse(dataUpdate.poll_ids) } };
      }

      const dataReturn = await this.requestService.update(dataUpdate);
      if (requestObject.post_status === "pending" && dataUpdate?.post_status === "publish") {
        //user post
        const dataPermission = await this.channelPermissionService.findOne({
          user_id: requestObject.user_id,
          channel_id: channelId,
        });
        //Update
        const dataChannelPoint = dataPermission?.channel_id?.point_data;
        //Check point
        let dataPoint = 5;
        if (dataChannelPoint && dataChannelPoint?.length) {
          for (const dataChannelPointItem of dataChannelPoint) {
            if (dataChannelPointItem?.key == "post_new") {
              dataPoint = parseInt(dataChannelPointItem?.value);
            }
          }
        }

        await this.channelPermissionService.updateCount(
          { _id: dataPermission?._id?.toString(), channel_id: dataPermission?.channel_id?._id.toString() },
          { point: dataPoint, point_month: dataPoint, point_week: dataPoint },
          req?.auth_code,
          {
            entity_id: requestObject?._id?.toString(),
            entity_type: "post",
            content: requestObject?.post_title,
            point_number: dataPoint,
            user_id: requestObject?.user_id?._id.toString(),
          },
          "post_new"
        );

        await this.notificationHelper.sendNotification({
          channel_id: requestObject?.channel_id?.toString(),
          user_id: [requestObject?.user_id?._id.toString()],
          title: `BÀI ĐĂNG ĐƯỢC PHÊ DUYỆT`,
          path: `/v/`,
          request_id: requestObject._id.toString(),
          content: () => {
            return `Quản trị viên đã phê duyệt bài đăng của bạn`;
          },
        });
      }
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
  async handleUpdateRequestComment(dataUpdate: UpdateRequestCommentDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = userObject._id.toString();
      //Check Comment ID
      const commentObject = await this.requestCommentService.findById(dataUpdate?._id?.toString());

      //Check User create
      if (commentObject?.user_id?.toString() !== userObject?._id?.toString()) {
        const dataPermission = await this.userPermissionService.isHavePermission(userId, "request/update");
        if (!dataPermission) {
          throw new BadRequestException("You haven't permission for this Action!");
        }
      }

      const dataReturn = await this.requestCommentService.update(dataUpdate);
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
  async handleUpdateCategory(dataUpdate: UpdateRequestCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const dataReturn = await this.requestCategoryService.update(dataUpdate);
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
  async handleDeleteRequest(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = userObject._id.toString();
      const requestObject = await this.requestService.findById(id);
      const channelId = requestObject.channel_id;
      const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("comment/delete") !== -1)
      ) {
        havePermission = true;
      }
      if (requestObject?.user_id?._id?.toString() == userId) {
        havePermission = true;
      }
      if (await this.userPermissionService.isHavePermission(userId, "request/delete")) {
        havePermission = true;
      }

      if (havePermission) {
        //Check Permission
        const dataReturn = await this.requestService.remove(id);
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
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getRequestCategoryList(query: ListRequestCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000 || !query.limit) {
        query.limit = 1000;
      }

      const limit = query.limit ? query.limit : 1000;
      const page = query.page ? query.page : 1;
      const orderByOBject = {};

      const dataToFilter = { ...query };

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.requestCategoryService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.requestCategoryService.count(dataToFilter);
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
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleDeleteComment(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      const getCommentObject = await this.requestCommentService.findByIdPopulate(id);
      const channelId = getCommentObject?.request_id?.channel_id;
      const userPermission = await this.channelPermissionService.findOne({ user_id: userId, channel_id: channelId });
      let havePermission = false;
      if (
        userPermission?.channel_role == "mentor" ||
        userPermission?.channel_role == "super_admin" ||
        (userPermission?.channel_role == "user" && userPermission?.permission?.indexOf("comment/delete") !== -1)
      ) {
        havePermission = true;
      }

      if (getCommentObject?.user_id?._id?.toString() == userId) {
        havePermission = true;
      }

      if (await this.userPermissionService.isHavePermission(userId, "request/delete")) {
        havePermission = true;
      }
      if (havePermission) {
        //Check Permission
        const dataReturn = await this.requestCommentService.remove(id);

        if (dataReturn?.parent_id) {
          const dataUpdateRemove = {
            _id: dataReturn?.parent_id?.toString(),
            child: dataReturn?._id,
          };
          await this.requestCommentService.updateArray(dataUpdateRemove, true);
        }

        //check subcomment
        const subcomments = await this.requestCommentService.filter(
          {
            parent_id: id,
          },
          {},
          1,
          999
        );

        //Update Count
        const dataUpdateCount = {
          _id: getCommentObject?.request_id?._id?.toString(),
        };
        const dataUpdate = {
          comment_number: -(subcomments.length + 1),
        };
        await this.requestService.updateCount(dataUpdateCount, dataUpdate);

        //Update child
        if (getCommentObject?.parent_id) {
          const dataToUpdateArray = {
            child_number: -(subcomments.length + 1),
          };
          await this.requestCommentService.updateCount(
            { _id: getCommentObject?.parent_id?.toString() },
            dataToUpdateArray
          );
        }

        await this.requestCommentService.deleteManyByIds(
          subcomments.map((subcomment) => {
            return subcomment?._id.toString();
          })
        );

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
  async handleDeleteCategory(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "request/delete")) {
        //Check Permission
        const dataReturn = await this.requestCategoryService.remove(id);
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

  async plusPointNNotiShareAction(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      const channelId = req?.channel_id;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      const dataPermission = await this.channelPermissionService.findOne({
        user_id: userId,
        channel_id: channelId,
      });
      const dataUpdateCount = {
        share_number: 1,
      };
      await this.requestService.updateCount({ _id: id }, dataUpdateCount);
      const channel = await this.channelService.findById(channelId);
      const foundGameSetting = channel.point_data.find((obj) => obj.key === "share");
      let point = "";
      if (!foundGameSetting) {
        point = "4";
      } else {
        point = foundGameSetting.value;
      }
      await this.channelPermissionService.updateCount(
        { _id: dataPermission?._id?.toString(), channel_id: channelId },
        { point: point, point_month: point, point_week: point },
        req?.auth_code,
        {
          entity_id: id,
          entity_type: "share",
          point_number: point,
          user_id: userId,
        },
        "share"
      );
      return res.set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" }).status(HttpStatus.OK).json({
        message: "Share successfully!",
      });
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
    str = str.replace(/-+$/g, "") + new Date().getTime();
    return str;
  }
}
