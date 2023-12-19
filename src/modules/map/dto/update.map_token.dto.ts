import { IsString } from "class-validator";

export class UpdateMapTokenDto {
  @IsString()
  _id: string;
}
