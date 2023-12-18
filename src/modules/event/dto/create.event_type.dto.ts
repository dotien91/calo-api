import { IsOptional, IsString, IsUrl } from "class-validator";

export class CreateEventTypeDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsUrl()
  icon: string;

  @IsString()
  @IsOptional(null)
  parent_id: string;
}
