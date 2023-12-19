import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PostService } from "./services/post.service";
import { Post, PostSchema } from "./schemas/post.schema";
import { PostHelper } from "./helper/post.helper";
import { PostUserController } from "./controllers/post_user.controller";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { PostCategory, PostCategorySchema } from "./schemas/post_category.schema";
import { PostCategoryHelper } from "./helper/post_category.helper";
import { PostCategoryService } from "./services/post_category.service";
import { PostCrawl, PostCrawlSchema } from "./schemas/post_crawl.schema";
import { PostCrawlService } from "./services/post_crawl.service";
import { PostPrompt, PostPromptSchema } from "./schemas/post_prompt.schema";
import { PostPromptService } from "./services/post_prompt.service";
import { PostAnonymous, PostAnonymousSchema } from "./schemas/post_anonymous.schema";
import { PostAnonymousService } from "./services/post_anonymous.service";
import { PostController } from "./controllers/post.controller";
import { PromptHistory, PromptHistorySchema } from "./schemas/prompt_history.schema";
import { PromptHistoryService } from "./services/prompt_history.service";
import { PromptHistoryHelper } from "./helper/prompt_history.helper";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: PostCategory.name, schema: PostCategorySchema },
      { name: PostCrawl.name, schema: PostCrawlSchema },
      { name: PostPrompt.name, schema: PostPromptSchema },
      { name: PostAnonymous.name, schema: PostAnonymousSchema },
      { name: PromptHistory.name, schema: PromptHistorySchema },
    ]),
  ],
  controllers: [PostController, PostUserController],
  providers: [
    PostService,
    PostCategoryHelper,
    PostHelper,
    UserPermissionService,
    PromptHistoryService,
    PromptHistoryHelper,
    PostCategoryService,
    PostPromptService,
    PostCrawlService,
    PostAnonymousService,
  ],
  exports: [PostHelper],
})
export class PostModule {}
