import { Module } from "@nestjs/common";
import { HttpClientService } from "../../base/http-client/http.base";
import { GptService } from "./services/gpt.service";

@Module({
  imports: [],
  controllers: [],
  providers: [GptService, HttpClientService],
  exports: [GptService],
})
export class GptModule {}
