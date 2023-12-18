import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateChannelLikeDto {
    @IsString()
    @ApiProperty()
    user_id: string

    @IsString()
    @ApiProperty()
    video_id: string
}
