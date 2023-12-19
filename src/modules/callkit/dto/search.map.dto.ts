import { UsePipes, ValidationPipe } from "@nestjs/common";
@UsePipes(
  new ValidationPipe({
    disableErrorMessages: true,
    forbidNonWhitelisted: false,
    whitelist: false,
  })
)
export class SearchMapDto {}
