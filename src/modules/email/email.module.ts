import { Module } from "@nestjs/common";
import { HttpClientService } from "../../base/http-client/http.base";
import { HttpConfig } from "../../base/http-config/http.config";
import { EmailService } from "./services/email.service";

@Module({
  imports: [],
  controllers: [],
  providers: [EmailService, HttpClientService, HttpConfig],
  exports: [EmailService],
})
export class EmailModule {}
