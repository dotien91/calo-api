import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CourseModule } from "../course/course.module";
import { ThreadController } from "./controllers/thread.controller";
import { ThreadHelper } from "./helpers/thread.helper";
import { ThreadCommentHelper } from "./helpers/thread_comment.helper";
import { Thread, ThreadSchema } from "./schemas/thread.schema";
import { ThreadComment, ThreadCommentSchema } from "./schemas/thread_comment.schema";
import { ThreadService } from "./services/thread.service";
import { ThreadCommentService } from "./services/thread_comment.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Thread.name, schema: ThreadSchema },
      { name: ThreadComment.name, schema: ThreadCommentSchema },
    ]),
    CourseModule,
  ],
  controllers: [ThreadController],
  providers: [ThreadService, ThreadHelper, ThreadCommentService, ThreadCommentHelper],
  exports: [ThreadService],
})
export class ThreadModule {}

