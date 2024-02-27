import { Injectable } from "@nestjs/common";
import { HttpClientService } from "../../../base/http-client/http.base";
import { HttpConfig } from "../../../base/http-config/http.config";
import { SendEmailPayload } from "./email.service.i";

@Injectable()
export class EmailService {
  constructor(private httpClient: HttpClientService, private httpConfig: HttpConfig) {}

  async send(payload: SendEmailPayload) {
    return await this.httpClient.post$(`${this.httpConfig.emailConfig}/api/email/add`, {
      eventName: payload.eventName,
      email: payload.email,
      language: payload.language,
      replacePattern: payload.replacePattern,
    });
  }
}

