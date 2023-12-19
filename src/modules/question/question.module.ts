import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { QuestionService } from "./services/question.service";
import { Question, QuestionSchema } from "./schemas/question.schema";
import { Plan, PlanSchema } from "../plan/schemas/plan.schema";
import { QuestionHelper } from "./helper/question.helper";
import { QuestionController } from "./controllers/question.controller";
import { Subscribe, SubscribeSchema } from "../subscribe/schemas/subscribe.schema";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { Purchase, PurchaseSchema } from "../purchase/schemas/purchase.schema";
import { Answer, AnswerSchema } from "./schemas/answer.schema";
import { AnswerService } from "./services/answer.service";
import { AnswerHelper } from "./helper/answer.helper";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscribe.name, schema: SubscribeSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: Answer.name, schema: AnswerSchema },
    ]),
  ],
  controllers: [QuestionController],
  providers: [QuestionService, AnswerService, AnswerHelper, QuestionHelper, UserPermissionService],
  exports: [QuestionHelper],
})
export class QuestionModule {}
