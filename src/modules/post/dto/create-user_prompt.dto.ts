import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
export class CreateUserPromptDto {
  @IsString()
  @ApiProperty()
  user_id?: string;

  @IsString()
  @ApiProperty()
  prompt_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  question?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  answer?: any;
}
