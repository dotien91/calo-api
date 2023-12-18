import { IsNumber, IsNotEmpty, IsString, IsNumberString, IsOptional, IsJSON } from 'class-validator';

export class CreateChatHistoryWithMediaDto {
    @IsString()
    chat_room_id: string;

    @IsString()
    @IsOptional(null)
    chat_content?: string;

    @IsString()
    @IsOptional(null)
    parent_id?: string;

    @IsJSON()
    @IsOptional(null)
    media_data?: string

    @IsString()
    @IsOptional(null)
    local_id?: string

    @IsString()
    @IsOptional(null)
    chat_status?: string

    @IsString()
    @IsOptional(null)
    message_type?: string

    @IsString()
    @IsOptional(null)
    local_data_media?: string

    @IsString()
    @IsOptional(null)
    send_at?: string

    @IsString()
    @IsOptional(null)
    topic_post_id?: string
}
