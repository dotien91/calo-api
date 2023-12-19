import { IsJSON, IsString } from "class-validator";

export class CreateFaceDetectionDto {
  @IsString()
  id_compare: string;

  @IsJSON()
  media_ids: string | string[];
}
