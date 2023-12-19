import { IsOptional, IsDateString, IsString } from "class-validator";
export class CreateUserPermissionDto {
  @IsString()
  permission: string;

  @IsDateString()
  @IsOptional(null)
  expired_at: string;
}
