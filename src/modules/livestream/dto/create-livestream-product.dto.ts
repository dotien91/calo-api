import { IsArray, IsDefined, IsString } from "class-validator";

export class CreateLiveStreamProduct {
  @IsArray()
  @IsDefined()
  product_ids: string[];

  @IsString()
  @IsDefined()
  livestream_id: string;
}

