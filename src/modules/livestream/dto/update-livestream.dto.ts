import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { CreateLivestreamDto } from "./create-livestream.dto";

export class UpdateLivestreamDto extends CreateLivestreamDto {
  @IsString()
  @ApiProperty()
  _id: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  title?: string;
}
