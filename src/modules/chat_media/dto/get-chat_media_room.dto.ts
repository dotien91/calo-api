import { IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from 'class-validator';

export class GetChatMediaRoomDto {
    @IsNumberString()
    @IsOptional(null)
    page: number;

    @IsNumberString()
    @IsOptional(null)
    limit: number

    @IsIn(['DESC', 'ASC'])
    @IsOptional(null)
    order_by: 'DESC'|'ASC'

    @IsString()
    @IsOptional(null)
    media_type: string

    @IsIn([0, 1])
    @IsOptional(null)
    @IsNumberString()
    media_status: number

    @IsString()
    @IsOptional(null)
    user_id: string

    @IsString()
    @IsOptional(null)
    gender?: string

    @IsNumberString()
    @IsOptional(null)
    sexual_content?: number
}
