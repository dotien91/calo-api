import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateCourseLikeDto {
    @IsString()
    @ApiProperty()
    user_id: string

    @IsString()
    @ApiProperty()
    course_id: string
}
