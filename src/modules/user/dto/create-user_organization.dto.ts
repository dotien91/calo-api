import { IsArray, IsDefined, IsOptional, IsString } from "class-validator";

export class CreateUserOrganizationDto {
  @IsString()
  @IsDefined()
  name: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  cover?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  long_description?: string;
}

export class AddMemberToOrganizationDto {
  @IsString()
  @IsDefined()
  organization_id: string;

  @IsArray()
  @IsDefined()
  user_ids?: string[];
}

export class RemoveMemberFromOrganizationDto {
  @IsString()
  @IsDefined()
  organization_id: string;

  @IsArray()
  @IsDefined()
  user_ids?: string[];
}
