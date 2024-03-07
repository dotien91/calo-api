import { IHttpConfig } from "./http.config.i";

export class HttpConfig implements IHttpConfig {
  public emailConfig: string;
  public socketConfig: string;
  public botConfig: string;

  constructor() {
    this.emailConfig = process.env.EMAIL_SERVICE_HOST || "http://localhost:4001";
    this.socketConfig = process.env.SOCKET_SERVICE_HOST || "http://localhost:3750";
    this.botConfig = process.env.BOT_SERVICE_HOST || "http://localhost:4102";
  }
}
