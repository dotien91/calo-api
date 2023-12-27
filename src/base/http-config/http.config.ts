import { IHttpConfig } from "./http.config.i";

export class HttpConfig implements IHttpConfig {
  public emailConfig: string;

  constructor() {
    this.emailConfig = process.env.EMAIL_SERVICE_HOST || "http://localhost:4001";
  }
}

