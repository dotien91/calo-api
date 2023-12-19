import { BadRequestException, ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";
import cheerio from "cheerio";
import { Response } from "express";
import { Types } from "mongoose";
import { DecodeUserToken } from "../../../dto/decode-user-token.dto";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { Channel } from "../../../modules/channel/schemas/channel.schema";
import { ChannelPermission } from "../../../modules/channel/schemas/channel_permission.schema";
import { ChannelService } from "../../../modules/channel/services/channel.service";
import { ChannelPermissionService } from "../../../modules/channel/services/channel_permission.service";
import { EventHookNotificationService } from "../../../modules/hook/services/hook_notification.service";
import { NotificationHelper } from "../../../modules/notification/helper/notification.helper";
import { User } from "../../../modules/user/schemas/user.schema";
import { UserService } from "../../../modules/user/services/user.service";
import { UserAnonymousService } from "../../../modules/user/services/user_anonymous.service";
import { UserAnonymousSessionService } from "../../../modules/user/services/user_anonymous_session.service";
import { UserOptionService } from "../../../modules/user/services/user_option.service";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { CreateTicketDto } from "../dto/create-ticket.dto";
import { CreateTicketCategoryDto } from "../dto/create-ticket_category.dto";
import { CreateTicketCommentDto } from "../dto/create-ticket_comment.dto";
import { ListTicketDto } from "../dto/list-ticket.dto";
import { ListTicketCategoryDto } from "../dto/list-ticket_category.dto";
import { ListTicketCommentDto } from "../dto/list-ticket_comment.dto";
import { UpdateTicketDto } from "../dto/update-ticket.dto";
import { UpdateTicketCategoryDto } from "../dto/update-ticket_category.dto";
import { UpdateTicketCommentDto } from "../dto/update-ticket_comment.dto";
import { TicketComment } from "../schemas/ticket-comment.schema";
import { Ticket as TicketNew } from "../schemas/ticket.schema";
import { TicketService } from "../services/ticket.service";
import { TicketCategoryService } from "../services/ticket_category.service";
import { TicketCommentService } from "../services/ticket_comment.service";
const { getFirestore } = require("firebase-admin/firestore");
const dataCrawl = `Other`;

/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class TicketHelper {
  constructor(
    private ticketService: TicketService,
    private ticketCategoryService: TicketCategoryService,
    private userPermissionService: UserPermissionService,
    private ticketCommentService: TicketCommentService,
    private userAnonymousSession: UserAnonymousSessionService,
    private userAnonymousService: UserAnonymousService,
    private userService: UserService,
    private userOptionService: UserOptionService,
    private notificationHelper: NotificationHelper,
    private channelPermissionService: ChannelPermissionService,
    private readonly channelService: ChannelService,
    private readonly eventHookNotificationService: EventHookNotificationService
  ) {}

  async handleRedditCategory() {
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
    }
    return true;
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
          const dataCategory = await this.ticketCategoryService.filter(dataSearch, {}, 1, 1);
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

        let dataTicket = {
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
          dataTicket = { ...dataTicket, ...{ post_slug: dataSlug, user_id: userObject._id.toString() } };
        }

        const dataTicketSearch = await this.ticketService.findOne({ post_slug: dataSlug });
        // console.log(dataTicketSearch, "dataTicketSearch");
        // console.log(dataTicket, "dataTicket");
        let dataCreate = null;
        if (!dataTicketSearch && dataSlug) {
          //Create
          dataCreate = await this.ticketService.create(dataTicket);
        } else {
          if (dataTicketSearch) {
            dataTicket = { ...dataTicket, ...{ _id: dataTicketSearch._id?.toString() } };
            dataCreate = await this.ticketService.update(dataTicket);
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
          const dataCategoryObject = await this.ticketCategoryService.filter(dataSearch, {}, 1, 1);
          console.log(dataCategoryObject, "dataCategory");
          if (dataCategoryObject && dataCategoryObject[0]) {
            const categoryId = dataCategoryObject[0]?._id?.toString();
            const dataUpdateCategory = {
              post_category: categoryId,
              _id: localId,
            };
            await this.ticketService.update(dataUpdateCategory);
          }
        }
      }
    }
    const dataComment: any = dataAxios?.comments;
    console.log(dataComment, "dataComment");

    for (const [key, dataCommentItem] of Object.entries(dataComment)) {
      //Check comment in DB
      //@ts-ignore
      const dataCheckComment = await this.ticketCommentService.findOne({ ref_id: dataCommentItem.id });
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
            ticket_id: localId,
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
            const dataParent = await this.ticketCommentService.findOne({ ref_id: dataCommentItem?.parentId });
            if (dataParent) {
              idParent = dataParent?._id?.toString();
              dataToCreate = { ...dataToCreate, ...{ parent_id: idParent } };
            }
          }
          console.log(dataToCreate, "dataToCreate");
          const dataCreateComment = await this.ticketCommentService.create(dataToCreate);
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
      const dataCategory = await this.ticketCategoryService.filter(dataSearch, {}, 1, 1);
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

    let dataTicket = {
      post_category: categoryId,
      post_content: dataText,
      post_title: dataTitle,
      post_language: "en",
      country: "US",
    };

    const dataSlug = this.toSlug(dataTitle);

    if (dataSlug && userObject) {
      dataTicket = { ...dataTicket, ...{ post_slug: dataSlug, user_id: userObject._id.toString() } };
    }

    const dataTicketSearch = await this.ticketService.findOne({ post_slug: dataSlug });
    console.log(dataTicketSearch, "dataTicketSearch");
    console.log(dataTicket, "dataTicket");
    if (!dataTicketSearch && dataSlug) {
      //Create
      await this.ticketService.create(dataTicket);
    } else {
      if (dataTicketSearch) {
        dataTicket = { ...dataTicket, ...{ _id: dataTicketSearch._id?.toString() } };
        await this.ticketService.update(dataTicket);
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
    const dataCategory = await this.ticketCategoryService.filter({}, {}, 1, 100);
    for (const dataCategoryItem of dataCategory) {
      const dataToUpdate = {
        version: 82,
        _id: dataCategoryItem?._id?.toString(),
      };
      console.log(dataToUpdate, "dataToUpdate");
      const dataUpdate = await this.ticketCategoryService.update(dataToUpdate);
      console.log(dataUpdate, "dataUpdate");
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
        await this.ticketCategoryService.create(dataToCreate);
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
  async getListTicket(query: ListTicketDto, res: Response, req: ExpressRequestDto) {
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

      const userId = req?.user_id || "";

      const dataToFilter = { ...query, ...{ channel_id: req?.channel_id || "", user_id: userId } };

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturn = await this.ticketService.filter(dataToFilter, orderByOBject, page, limit);

      const dataCount = await this.ticketService.count(dataToFilter);
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
  async createNewTicket(createTicketData: CreateTicketDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const dataSlug = this.toSlug(createTicketData.post_title);
      const getTotalAdmin = await this.channelPermissionService.filter(
        { channel_id: process.env.DEFAULT_CHANNEL, channel_role: "mentor" },
        {},
        1,
        100
      );
      const userArray = getTotalAdmin?.map((channelPermissionItem: ChannelPermission, index: number) => {
        return channelPermissionItem?.user_id?._id?.toString();
      });
      const totalArray = [...[userObject._id.toString()], ...userArray];
      const channelId = req?.channel_id || null;
      createTicketData = {
        ...createTicketData,
        ...{ post_slug: dataSlug, user_id: totalArray, channel_id: [channelId, process.env.DEFAULT_CHANNEL] },
      };

      const userCountry = userObject?.country;
      createTicketData = { ...createTicketData, ...{ country: userCountry } };

      if (this.validateJson(createTicketData?.attach_files)) {
        createTicketData = {
          ...createTicketData,
          ...{
            attach_files: JSON.parse(createTicketData?.attach_files),
          },
        };
      } else {
        createTicketData = {
          ...createTicketData,
          ...{
            attach_files: [],
          },
        };
      }

      const dataCreate: any = await this.ticketService.create(createTicketData);
      const dataReturn = await this.ticketService.findById(dataCreate?._id?.toString());

      //Update Notification
      const dataUpdateNotification = {
        _id: userObject?._id?.toString(),
        notification_ticket: dataCreate?._id?.toString(),
      };
      await this.userService.updateArray(dataUpdateNotification, false);

      const channel = await this.channelService.findById(channelId);

      this.eventHookNotificationService.sendNotiNMailCreateNewTicket({
        send_user_id: req?.user_id?.toString(),
        user_id: channel?.user_id?._id.toString(),
        channel_id: channelId,
        path: `/r/support/${dataReturn._id.toString()}`,
        mail_template: "create_new_ticket",
        content: (params: any) => {
          return `${userObject?.display_name} tạo mới ticket`;
        },
        title: `${userObject?.display_name.toLocaleUpperCase()} TẠO MỚI TICKET THÀNH CÔNG`,
      });

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
   * @param dataTicket
   * @returns
   */
  async handleSendNotificationToAll(
    fromUser: User,
    dataTicket: TicketNew,
    authCode: string = "",
    channelObject: any = {},
    req: ExpressRequestDto
  ) {
    try {
      let notificationTitle = fromUser.display_name ? fromUser.display_name : fromUser.user_login;
      let chatContentToSend = `${notificationTitle} đã đăng: ${dataTicket.post_title}`;
      if (chatContentToSend && chatContentToSend.length >= 255) {
        chatContentToSend = chatContentToSend.substring(0, 250) + "...";
      }
      notificationTitle = notificationTitle + ` đăng bài mới!`;

      if (notificationTitle && notificationTitle.length >= 70) {
        notificationTitle = notificationTitle.substring(0, 68) + "...";
      }
      const userIdArray = [];
      const channelId = dataTicket?.channel_id?.toString();
      const emailArray = [];
      for (let itemPage: number = 1; itemPage <= 10; itemPage++) {
        const allUser = await this.channelPermissionService.filter({ channel_id: channelId }, {}, itemPage, 1000);
        for (const itemUser of allUser) {
          if (itemUser?.user_id?._id) {
            userIdArray.push(itemUser?.user_id?._id?.toString());
            const userEmail = itemUser?.user_id?.user_email;
            if (userEmail) {
              emailArray.push(userEmail);
            }
          }
        }
        if (!allUser?.length) {
          break;
        }
      }

      //Update Email
      const dataFirestore = getFirestore();

      for (const emailItem of emailArray) {
        //Let dataToUpdate
        const dataToUpdate = {
          brand_name: "Gamifa",
          channel: channelObject?.name?.toString(),
          post_name: dataTicket.post_title,
          //@ts-ignore
          post_image: dataTicket?.attach_files[0]?.media_url || "",
          email: emailItem,
          fullname: fromUser.display_name,
          user_id: fromUser?._id?.toString(),
          post_url: (channelObject?.domain || "https://gamifa.vn") + "/v/post/" + dataTicket?.post_slug,
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
          ticket_id: dataTicket?._id?.toString(),
          path: "/v/post/",
          data_id: dataTicket?.post_slug?.toString(),
        };
        const notificationContent = chatContentToSend;
        const dataNotification = {
          createdBy: fromUser._id.toString(),
          user_id: userIdArray,
          channel_id: req?.channel_id,
          title: notificationTitle?.toString(),
          content: notificationContent,
          param: JSON.stringify(dataToSendNotification),
          ticket_id: dataTicket?._id?.toString(),
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
    dataTicket: TicketNew,
    dataComment: TicketComment,
    authCode: string,
    channelObject: Channel,
    req: ExpressRequestDto
  ) {
    try {
      let notificationTitle = fromUser.display_name ? fromUser.display_name : fromUser.user_login;
      let chatContentToSend,
        chatContentRaw = `${notificationTitle} đã bình luận trong bài viết: ${dataComment.content}`;
      if (chatContentToSend && chatContentToSend.length >= 255) {
        chatContentToSend = chatContentToSend.substring(0, 250) + "...";
      }
      notificationTitle = notificationTitle + ` đã bình luận trong "${dataTicket?.post_title}`;

      if (notificationTitle && notificationTitle.length >= 70) {
        notificationTitle = notificationTitle.substring(0, 68) + '..."';
      } else {
        notificationTitle = notificationTitle + '"';
      }

      const userIdArray = [];
      const emailArray = [];

      // let dataUser = await this.userService.filter({ notification_ticket: dataTicket?._id?.toString() }, {}, 1, 1000);
      // for (let userItem of dataUser) {
      //   if (userItem?._id?.toString() !== fromUser?._id?.toString()) {
      //     userIdArray.push(userItem._id.toString());
      //     emailArray.push(userItem?.user_email?.toString())
      //   }
      // }

      //Update Email
      const dataFirestore = getFirestore();

      for (const emailItem of emailArray) {
        //Let dataToUpdate
        const dataToUpdate = {
          brand_name: "Gamifa",
          channel: channelObject?.name?.toString(),
          content: chatContentRaw,
          post_name: dataTicket.post_title,
          //@ts-ignore
          post_image: dataTicket?.attach_files[0]?.media_url || "",
          email: emailItem,
          fullname: fromUser.display_name,
          user_id: fromUser?._id?.toString(),
          post_url: (channelObject?.domain || "https://gamifa.vn") + "/v/post/" + dataTicket?.post_slug,
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
          ticket_id: dataTicket?._id?.toString(),
          path: "/v/post/",
          data_id: dataTicket?.post_slug?.toString(),
        };
        const notificationContent = chatContentToSend;
        const dataNotification = {
          createdBy: fromUser._id.toString(),
          user_id: userIdArray,
          channel_id: req?.channel_id,
          title: notificationTitle?.toString(),
          content: notificationContent,
          param: JSON.stringify(dataToSendNotification),
          ticket_id: dataTicket?._id?.toString(),
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
  async createNewComment(createTicketData: CreateTicketCommentDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject: any = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const dataTicketObject = await this.ticketService.findById(createTicketData?.ticket_id);
      if (!dataTicketObject) {
        throw new ForbiddenException("Ticket not exist!");
      }
      const dataUserObject = dataTicketObject?.user_id?.map((userObject: any, index: number) => {
        return userObject?._id?.toString();
      });

      //check permission
      if (dataUserObject?.indexOf(userObject?._id?.toString()) === -1) {
        throw new BadRequestException("You haven't permission for this Action!");
      }

      if (this.validateJson(createTicketData?.attach_files)) {
        createTicketData = {
          ...createTicketData,
          ...{
            attach_files: JSON.parse(createTicketData?.attach_files),
          },
        };
      } else {
        createTicketData = {
          ...createTicketData,
          ...{
            attach_files: [],
          },
        };
      }

      createTicketData = { ...createTicketData, ...{ user_id: userObject._id.toString() } };

      let dataCreate: any = await this.ticketCommentService.create(createTicketData);

      dataCreate = { ...dataCreate?.toObject(), ...{ user_id: userObject } };
      if (createTicketData?.parent_id) {
        const dataUpdate = {
          _id: createTicketData?.parent_id,
          child: dataCreate?._id,
        };
        await this.ticketCommentService.updateArray(dataUpdate, false);
      }
      //Update Count
      const dataUpdateCount = {
        _id: createTicketData?.ticket_id,
      };
      const dataUpdate = {
        comment_number: 1,
      };
      await this.ticketService.updateCount(dataUpdateCount, dataUpdate);

      //Update child

      if (createTicketData?.parent_id) {
        const dataToUpdateArray = {
          child_number: 1,
        };
        await this.ticketCommentService.updateCount({ _id: createTicketData?.parent_id }, dataToUpdateArray);
      }

      //Update Notification
      const dataUpdateNotification = {
        _id: userObject?._id?.toString(),
        notification_ticket: createTicketData?.ticket_id,
      };
      await this.userService.updateArray(dataUpdateNotification, false);

      const channel = await this.channelService.findById(req?.channel_id);

      this.eventHookNotificationService.sendNotiNMailCommentTicket({
        send_user_id: req?.user_id?.toString(),
        user_id: channel?.user_id?._id.toString(),
        channel_id: req?.channel_id,
        path: `/r/support/${createTicketData?.ticket_id.toString()}`,
        mail_template: "comment_ticket",
        content: (params: any) => {
          return `${userObject?.display_name} tạo mới ticket comment`;
        },
        title: `${userObject?.display_name.toLocaleUpperCase()} TẠO MỚI TICKET COMMENT`,
      });

      setTimeout(async () => {
        // await this.handleSendNotification(userObject, dataTicket, dataCreate, authCode, dataPermission?.channel_id);
      }, 500);

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
  async createCategory(createTicketData: CreateTicketCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const dataSlug = this.toSlug(createTicketData.category_title);
      createTicketData = { ...createTicketData, ...{ category_slug: dataSlug, user_id: userObject._id.toString() } };

      const dataCreate = await this.ticketCategoryService.create(createTicketData);
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
  async getListTicketComment(query: ListTicketCommentDto, res: Response, req: ExpressRequestDto) {
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

      const dataTicket = await this.ticketService.findOne({ _id: query?.ticket_id });
      if (!dataTicket) {
        throw new ForbiddenException("Ticket is invalid");
      }

      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      const dataReturnBefore = await this.ticketCommentService.filter(dataToFilter, orderByOBject, page, limit);
      const dataReturn: any = [];
      for (const itemBefore of dataReturnBefore) {
        dataReturn.push(itemBefore?.toObject());
      }
      const dataCount = await this.ticketCommentService.count(dataToFilter);
      const dataReturnFinal = [];

      let dataPermissionArrayObject = [];
      if (query?.auth_id && dataTicket?.channel_id) {
        const dataUserIds = dataReturn?.map((value) => {
          return value?.user_id?._id?.toString();
        });

        const dataToFilterPermission = {
          user_ids: dataUserIds,
          channel_id: dataTicket?.channel_id?.toString(),
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
  async handleGetDetailTicket(id: string, query: ListTicketDto, res: Response, req: ExpressRequestDto) {
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

      let dataReturn: any = await this.ticketService.findOne(dataToFilter);
      dataReturn = { ...dataReturn?.toObject() };

      const dataNotification = [];

      if (query?.auth_id) {
        const dataAuth = await this.userService.findById(query?.auth_id, {});
        //@ts-ignore
        if (dataAuth && dataAuth?.notification_ticket) {
          //@ts-ignore
          for (const dataItemNotification of dataAuth?.notification_ticket) {
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
      const dataReturn = await this.ticketCategoryService.findOne(dataToFilter);
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
      const dataReturn = await this.ticketCommentService.findOne(dataToFilter);
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
  async handleUpdateTicketByAdmin(dataUpdate: UpdateTicketDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const ticketObject = await this.ticketService.findById(dataUpdate?._id?.toString());

      const dataUserObject = ticketObject?.user_id?.map((userObject: any, index: number) => {
        return userObject?._id?.toString();
      });

      //check permission
      if (dataUserObject?.indexOf(userObject?._id?.toString()) === -1) {
        throw new BadRequestException("You haven't permission for this Action!");
      }

      if (dataUpdate.public_album) {
        dataUpdate = { ...dataUpdate, ...{ public_album: JSON.parse(dataUpdate.public_album) } };
      }
      if (dataUpdate.attach_files) {
        dataUpdate = { ...dataUpdate, ...{ attach_files: JSON.parse(dataUpdate.attach_files) } };
      }

      const dataReturn = await this.ticketService.update(dataUpdate);
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
  async handleUpdateTicketComment(dataUpdate: UpdateTicketCommentDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = userObject._id.toString();
      //Check Comment ID
      const commentObject = await this.ticketCommentService.findById(dataUpdate?._id?.toString());

      //Check User create
      if (commentObject?.user_id?.toString() !== userObject?._id?.toString()) {
        const dataPermission = await this.userPermissionService.isHavePermission(userId, "ticket/update");
        if (!dataPermission) {
          throw new BadRequestException("You haven't permission for this Action!");
        }
      }

      const dataReturn = await this.ticketCommentService.update(dataUpdate);
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
  async handleUpdateCategory(dataUpdate: UpdateTicketCategoryDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const dataReturn = await this.ticketCategoryService.update(dataUpdate);
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
  async handleDeleteTicket(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject || !id) {
        throw new ForbiddenException("User is invalid");
      }

      const userId = userObject._id.toString();
      const ticketObject = await this.ticketService.findById(id);
      const channelId = ticketObject.channel_id;

      const dataUserObject = ticketObject?.user_id?.map((userObject: any, index: number) => {
        return userObject?._id?.toString();
      });

      //check permission
      if (dataUserObject?.indexOf(userObject?._id?.toString()) === -1) {
        throw new BadRequestException("You haven't permission for this Action!");
      }

      //Check Permission
      const dataReturn = await this.ticketService.remove(id);
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
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getTicketCategoryList(query: ListTicketCategoryDto, res: Response, req: ExpressRequestDto) {
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
      const dataReturn = await this.ticketCategoryService.filter(dataToFilter, orderByOBject, page, limit);
      const dataCount = await this.ticketCategoryService.count(dataToFilter);
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
      const getCommentObject = await this.ticketCommentService.findByIdPopulate(id);
      const channelId = getCommentObject?.ticket_id?.channel_id;
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

      if (await this.userPermissionService.isHavePermission(userId, "ticket/delete")) {
        havePermission = true;
      }
      if (havePermission) {
        //Check Permission
        const dataReturn = await this.ticketCommentService.remove(id);

        if (dataReturn?.parent_id) {
          const dataUpdateRemove = {
            _id: dataReturn?.parent_id?.toString(),
            child: dataReturn?._id,
          };
          await this.ticketCommentService.updateArray(dataUpdateRemove, true);
        }

        //Update Count
        const dataUpdateCount = {
          _id: getCommentObject?.ticket_id?._id?.toString(),
        };
        const dataUpdate = {
          comment_number: -1,
        };
        await this.ticketService.updateCount(dataUpdateCount, dataUpdate);

        //Update child
        if (getCommentObject?.parent_id) {
          const dataToUpdateArray = {
            child_number: -1,
          };
          await this.ticketCommentService.updateCount(
            { _id: getCommentObject?.parent_id?.toString() },
            dataToUpdateArray
          );
        }

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
      if (await this.userPermissionService.isHavePermission(userId, "ticket/delete")) {
        //Check Permission
        const dataReturn = await this.ticketCategoryService.remove(id);
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
    return str;
  }
}
