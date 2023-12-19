import { IsEmail, IsOptional, IsString } from "class-validator";
export class CreateContactFormDto {
  @IsString()
  form_type: string;

  @IsString()
  @IsOptional(null)
  full_name?: string;

  @IsString()
  @IsOptional(null)
  address?: string;

  @IsString()
  @IsOptional(null)
  entity_id?: string;

  @IsString()
  @IsOptional(null)
  user_id?: string;

  @IsEmail()
  @IsOptional(null)
  email?: string;

  @IsString()
  @IsOptional(null)
  phone_number?: number;

  @IsString()
  @IsOptional(null)
  form_status?: any;

  @IsString()
  @IsOptional(null)
  country_phone_number?: string;

  @IsString()
  @IsOptional(null)
  bank_name?: string;

  @IsString()
  @IsOptional(null)
  bank_number?: string;

  @IsString()
  @IsOptional(null)
  bank_account_name?: string;

  @IsString()
  @IsOptional(null)
  content?: string;

  @IsString()
  @IsOptional(null)
  partner_id?: string;

  @IsString()
  @IsOptional(null)
  image?: string;
}
