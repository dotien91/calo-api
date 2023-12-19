import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject, IsJSON } from "class-validator";
export class CreateImportPromptDto {
  @IsString()
  @ApiProperty()
  category_id: string;

  @IsString()
  @ApiProperty()
  text: string;
}
