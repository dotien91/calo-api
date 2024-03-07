import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BotModule } from "../bot/bot.module";
import { GptService } from "../gpt/services/gpt.service";
import { TestController } from "./controllers/test.controller";
import { TestHelper } from "./helpers/test.helper";
import { TestQuestionHelper } from "./helpers/test_question.helper";
import { TestUserHelper } from "./helpers/test_user.helper";
import { Test, TestSchema } from "./schemas/test.schema";
import { TestQuestion, TestQuestionSchema } from "./schemas/test_question.schema";
import { TestUser, TestUserSchema } from "./schemas/test_user.schema";
import { TestService } from "./services/test.service";
import { TestQuestionService } from "./services/test_question.service";
import { TestUserService } from "./services/test_user.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Test.name, schema: TestSchema },
      { name: TestQuestion.name, schema: TestQuestionSchema },
      { name: TestUser.name, schema: TestUserSchema },
    ]),
    BotModule,
  ],
  controllers: [TestController],
  providers: [
    TestService,
    TestHelper,
    TestUserService,
    TestUserHelper,
    TestQuestionService,
    TestQuestionHelper,
    GptService,
  ],
  exports: [TestService, TestHelper, TestUserService, TestUserHelper, TestQuestionService, TestQuestionHelper],
})
export class TestModule {}
