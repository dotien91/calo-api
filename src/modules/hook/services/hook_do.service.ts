import { Injectable } from "@nestjs/common";
import { Course } from "../../../modules/course/schemas/course.schema";
import { CreateCourseUserDto } from "../../course/dto/create-course_user.dto";
import HookExpress from "../hook_express";
import { AddCoinToUserData, AddPointToUserData } from "../interfaces/hook.interface";

@Injectable()
export class EventHookWorkerService {
  constructor() {}

  AddPointToUser(data: AddPointToUserData) {
    HookExpress.do_action("user.plus-point", data);
  }

  AddCoinToUser(data: AddCoinToUserData) {
    HookExpress.do_action("user.plus-coin", data);
  }

  // PlusPointChallengePusher(data: PlusPointChallengeDto) {
  //   HookExpress.do_action("challenge.plus-point", data);
  // }

  // RedeemWorkerPusher(data: any) {
  //   HookExpress.do_action("redeem.check-permission", data);
  // }

  // RequestDeleteMultipleDocumentByChannelPermission(data: any) {
  //   HookExpress.do_action("request.delete-request-by-channel-permission", data);
  // }

  // ProcessAddCategory(data: any) {
  //   HookExpress.do_action("request.add-category", data);
  // }

  ProcessCourseOrder(dataCourseJoin: CreateCourseUserDto, courseData: Course) {
    HookExpress.do_action("course.add-payment", dataCourseJoin, courseData);
  }

  // ProcessAddLevel(data: any) {
  //   HookExpress.do_action("request.add-level", data);
  // }
}
