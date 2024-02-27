import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { CourseClassService } from "../../../modules/course/services/course_class.service";
import { User } from "../../../modules/user/schemas/user.schema";

@Injectable()
export class ThreadGuard implements CanActivate {
  constructor(private courseClassService: CourseClassService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userObject: User = request.user_object;

    if (!userObject) throw new UnauthorizedException("Require Token!");
    try {
      const courseClass = await this.courseClassService.findOne({ _id: request.headers["class-id"] });
      if (!courseClass) throw new Error("Not found class");
      const isJoin = [
        ...courseClass.members.map((memberId) => memberId.toString()),
        courseClass.user_id.toString(),
      ].find((memberId: any) => memberId === userObject._id.toString());
      if (!isJoin) throw new Error("You're not a part of this class");

      return true;
    } catch (e) {
      console.log(e);
      throw new ForbiddenException();
    }
  }
}
