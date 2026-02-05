import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./filters/http-exception.filter";
export * from "./modules/hook/hook_express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const rawBodyBuffer = (req: any, res: any, buf: any, encoding: any) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || "utf8");
    }
  };

  app.use(cookieParser());
  app.use(urlencoded({ verify: rawBodyBuffer, extended: true, limit: "500mb" }));
  app.use(json({ verify: rawBodyBuffer, limit: "500mb" }));

  const configService: ConfigService = app.get(ConfigService);
  app.setGlobalPrefix(configService.get<string>("APP_PREFIX") ? configService.get<string>("APP_PREFIX") : "api");

  // Sometime after NestFactory add this to add HTTP Basic Auth
  app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, X-Channel, X-Authorization, Content-Type, Accept, Class-Id"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method == "OPTIONS") {
      res.end();
    } else {
      next();
    }
  });
  app.use(json({ limit: "500mb" }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ disableErrorMessages: false, forbidNonWhitelisted: false, whitelist: true }));
  app.use(urlencoded({ extended: true, limit: "500mb" }));
  await app.listen(configService.get<string>("PORT"));
  console.log("[Calo API] version: new");
}

bootstrap();
