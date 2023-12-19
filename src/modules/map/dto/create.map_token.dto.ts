import { IsString } from "class-validator";

export class CreateMapTokenDto {
  @IsString()
  access_token: string;

  @IsString()
  token_type: string;

  @IsString()
  expires_in: string;

  @IsString()
  user_id: string;
}
