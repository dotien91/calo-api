import { Injectable } from "@nestjs/common";
import { HttpClientService } from "../../../base/http-client/http.base";
import { SendTelegramMessagePayload } from "./telegram.service.i";

@Injectable()
export class TelegramService {
  constructor(private httpClient: HttpClientService) {}

  async sendMessage(payload: SendTelegramMessagePayload) {
    return await this.httpClient.get$(`https://api.telegram.org/${process.env.TELEGRAM_BOT_ID}/sendMessage`, {
      chat_id: payload.chat_id,
      text: payload.text,
      parse_mode: payload.parse_mode,
    });
  }
}
