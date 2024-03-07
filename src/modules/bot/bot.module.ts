import { Module } from "@nestjs/common";
import { HttpClientService } from "../../base/http-client/http.base";
import { HttpConfig } from "../../base/http-config/http.config";
import { BotService } from "./services/bot.service";

@Module({
  imports: [],
  controllers: [],
  providers: [BotService, HttpClientService, HttpConfig],
  exports: [BotService, HttpClientService, HttpConfig],
})
export class BotModule {}
