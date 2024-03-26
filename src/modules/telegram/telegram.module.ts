import { Module } from "@nestjs/common";
import { HttpClientService } from "../../base/http-client/http.base";
import { TelegramService } from "./services/telegram.service";

@Module({
  imports: [],
  controllers: [],
  providers: [TelegramService, HttpClientService],
  exports: [TelegramService, HttpClientService],
})
export class TelegramModule {}
