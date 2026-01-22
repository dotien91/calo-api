import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { CalorieModule } from "../calorie/calorie.module";
import { User, UserSchema } from "../user/schemas/user.schema";
import { UserService } from "../user/services/user.service";
import { UserPermission, UserPermissionSchema } from "../user_permission/schemas/user_permission.schema";
import { UserPermissionService } from "../user_permission/services/user_permission.service";
import { MediaController } from "./controllers/media.controller";
import { Media, MediaSchema } from "./schemas/media.schema";
import { CloudinaryService } from "./services/cloudinary.service";
import { MediaService } from "./services/media.service";
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Media.name, schema: MediaSchema },
      { name: UserPermission.name, schema: UserPermissionSchema },
    ]),
    forwardRef(() => CalorieModule),
  ],
  controllers: [MediaController],
  providers: [MediaService, CloudinaryService, UserService, UserPermissionService],
  exports: [MediaService, CloudinaryService],
})
export class MediaModule {}
