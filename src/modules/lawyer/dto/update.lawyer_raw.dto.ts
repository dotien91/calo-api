import { IsString, IsOptional, IsUrl, IsIn } from "class-validator";
import { CreateLawyerRatingDto } from "./create.lawyer_rating.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CreateLawyerRawDto } from "./create.lawyer_raw.dto";

export class UpdateLawyerRawDto extends CreateLawyerRawDto {
  @IsString()
  @ApiProperty()
  _id: string;
}
