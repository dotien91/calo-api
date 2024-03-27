import { Module } from "@nestjs/common";
import { I18NService } from "./services/i18n.service";

@Module({
  imports: [],
  controllers: [],
  providers: [I18NService],
  exports: [I18NService],
})
export class I18NModule {}

