import { IsJSON, IsOptional, IsString } from "class-validator";
export class CreateConfigDto {
  @IsString()
  type: any;

  @IsJSON()
  @IsOptional(null)
  data_filter: any;

  @IsString()
  @IsOptional(null)
  data_content: any;

  @IsJSON()
  @IsOptional(null)
  option_content: any;
}
