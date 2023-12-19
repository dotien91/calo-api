import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject, IsJSON } from "class-validator";
export class CreatePostCrawlDto {
  @IsString()
  @ApiProperty()
  slug: string;

  @IsString()
  @ApiProperty()
  url: string;

  @IsString()
  @ApiProperty()
  data: string;
}
