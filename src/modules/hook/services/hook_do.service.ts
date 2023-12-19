import { Injectable } from "@nestjs/common";
import { PlusPointChallengeDto } from "../dtos/plus_point_challenge.dto";
import HookExpress from "../hook_epress";
import { CreateCourseLikeDto } from "../../../modules/course/dto/create-course_like.dto";
import { Course } from "../../../modules/course/schemas/course.schema";

@Injectable()
export class EventHookWorkerService {
  constructor() {}

  PlusPointChallengePusher(data: PlusPointChallengeDto) {
    HookExpress.do_action("challenge.plus-point", data);
  }

  RedeemWorkerPusher(data: any) {
    HookExpress.do_action("redeem.check-permission", data);
  }

  RequestDeleteMultipleDocumentByChannelPermission(data: any) {
    HookExpress.do_action("request.delete-request-by-channel-permission", data);
  }

  ProcessAddCategory(data: any) {
    HookExpress.do_action("request.add-category", data);
  }

  ProcessCourseOrder(dataCourseJoin: CreateCourseLikeDto, courseData: Course) {
    HookExpress.do_action("course.add-payment", dataCourseJoin, courseData);
  }

  ProcessAddLevel(data: any) {
    HookExpress.do_action("request.add-level", data);
  }
}
