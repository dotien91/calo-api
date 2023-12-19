import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { CreateChannelBannerDto } from "./create-channel_banner.dto";

export class UpdateChannelBannerDto extends CreateChannelBannerDto {
  @IsString()
  @ApiProperty()
  _id: string;
}
