import { IsJSON, IsOptional } from "class-validator";

export class CreateChatAI {
  @IsJSON()
  @IsOptional(null)
  options: string;
}
