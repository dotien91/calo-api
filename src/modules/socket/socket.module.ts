import { Module } from "@nestjs/common";
import { HttpClientService } from "../../base/http-client/http.base";
import { HttpConfig } from "../../base/http-config/http.config";
import { SocketService } from "./services/socket.service";

@Module({
  imports: [],
  controllers: [],
  providers: [SocketService, HttpClientService, HttpConfig],
  exports: [SocketService, HttpClientService, HttpConfig],
})
export class SocketModule {}
