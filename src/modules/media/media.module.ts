import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserService } from "../user/services/user.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { MediaController } from "./controllers/media.controller";
import { Media, MediaSchema } from "./schemas/media.schema";
import { MediaService } from "./services/media.service";
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Media.name, schema: MediaSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
    ]),
  ],
  controllers: [MediaController],
  providers: [MediaService, UserService, UserPermissionService],
  exports: [MediaService],
})
export class MediaModule {}
