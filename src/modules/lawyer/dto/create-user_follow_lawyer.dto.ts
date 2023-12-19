import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateUserFollowLawyerDto {
  @IsString()
  @ApiPropertyOptional()
  lawyer_id: string;
}
