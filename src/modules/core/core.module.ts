import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtHelperService } from './services/jwt_helper.service';
import { UserSession, UserSessionSchema } from '../user/schemas/user_session.schema';
import { UserSessionService } from '../user/services/user_session.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: UserSession.name, schema: UserSessionSchema}
  ])],
  providers: [JwtHelperService, UserSessionService],
  exports: [JwtHelperService]
})
export class CoreModule {}
