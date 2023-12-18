import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListChatHistoryDto {
    @IsNumberString()
    @IsOptional(null)
    page: number;

    @IsString()
    @IsOptional(null)
    from_id: string;

    @IsString()
    @IsOptional(null)
    to_id: string;

    @IsNumberString()
    @IsOptional(null)
    limit: number

    @IsString()
    @IsOptional(null)
    search: string

    @IsIn(['DESC', 'ASC'])
    @IsOptional(null)
    order_by: 'DESC'|'ASC'

    @IsString()
    @IsOptional(null)
    topic_post_id?: string
}
