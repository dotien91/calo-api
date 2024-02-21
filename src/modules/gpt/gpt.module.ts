import { Module } from "@nestjs/common";
import { GptService } from "./services/gpt.service";

@Module({
  imports: [],
  controllers: [],
  providers: [GptService],
  exports: [GptService],
})
export class GptModule {}

