import { Injectable } from "@nestjs/common";
import { HttpClientService } from "../../../base/http-client/http.base";
import { HttpConfig } from "../../../base/http-config/http.config";
import { FluencyScorePayload } from "./bot.service.i";

@Injectable()
export class BotService {
  constructor(private httpClient: HttpClientService, private httpConfig: HttpConfig) {}

  async getFluencyScore(payload: FluencyScorePayload) {
    return await this.httpClient.postBinary$(
      `${this.httpConfig.botConfig}/junbro1016/pronunciation-scoring-fluency`,
      payload.audio_buffer
    );
  }

  async getPronounceScore(payload: FluencyScorePayload) {
    return await this.httpClient.postBinary$(
      `${this.httpConfig.botConfig}/junbro1016/pronunciation-scoring-completeness`,
      payload.audio_buffer
    );
  }
}
