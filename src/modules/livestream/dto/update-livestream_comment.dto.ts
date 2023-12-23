import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateLivestreamCommentDto {
    @IsString()
    @ApiProperty()
    user_id: string

    @IsString()
    @ApiProperty()
    livestream_id: string
}
