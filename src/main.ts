import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { HttpExceptionFilter } from "./filters/http-exception.filter";
import { ValidationPipe } from "@nestjs/common";
import { urlencoded, json } from "express";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as bodyParser from "body-parser";
import * as basicAuth from "express-basic-auth";
import * as cookieParser from "cookie-parser";
export * from './modules/hook/hook_epress'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const rawBodyBuffer = (req: any, res: any, buf: any, encoding: any) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || "utf8");
    }
  };
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true, limit: "500mb" }));
  app.use(bodyParser.json({ verify: rawBodyBuffer, limit: "500mb" }));
  const configService: ConfigService = app.get(ConfigService);

  // Sometime after NestFactory add this to add HTTP Basic Auth
  app.use(
    // Paths you want to protect with basic auth
    "/swagger*",
    basicAuth({
      challenge: true,
      users: {
        taki: "Taki@1234",
      },
    })
  );

  app.setGlobalPrefix(configService.get<string>("APP_PREFIX") ? configService.get<string>("APP_PREFIX") : "api");
  const config = new DocumentBuilder()
    .setTitle("Gamifa API")
    .setDescription("Gamifa API - Author ICEO")
    .setVersion("1.0")
    .addTag("challenge")
    .addTag("transaction")
    .addTag("user")
    .addTag("order")
    .addTag("homepage")
    .addTag("course")
    .addTag("channel")
    .addTag("event")
    .addTag("chat")
    .addTag("livestream")
    .addTag("gift")
    .addTag("plan")
    .addTag("ticket")
    .addTag("redeem")
    .setBasePath("api")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" }, "ICEO")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, X-Channel, X-Authorization, Content-Type, Accept"
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
}

bootstrap();
