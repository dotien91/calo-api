import { Injectable } from "@nestjs/common";
import { HttpClientService } from "../../../base/http-client/http.base";
import { HttpConfig } from "../../../base/http-config/http.config";

@Injectable()
export class SocketService {
  constructor(private httpClient: HttpClientService, private httpConfig: HttpConfig) {}

  async send(path: string, headers: any, body: any) {
    const url = `${this.httpConfig.socketConfig}/${path}`;
    return await this.httpClient.post$(url, body, headers);
  }
}
