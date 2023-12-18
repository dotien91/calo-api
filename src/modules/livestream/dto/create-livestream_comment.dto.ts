import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsString, IsNumberString, IsOptional, IsJSON } from 'class-validator';

export class CreateLivestreamCommentWithMediaDto {
    @IsString()
    @ApiProperty()
    livestream_id: string;

    @IsString()
    @ApiProperty()
    chat_content?: string;

    @IsString()
    @ApiPropertyOptional()
    @IsOptional(null)
    parent_id?: string;

    @IsJSON()
    @IsOptional(null)
    @ApiPropertyOptional()
    media_data?: string

    @IsString()
    @IsOptional(null)
    @ApiPropertyOptional()
    chat_status?: string

    @IsString()
    @IsOptional(null)
    @ApiPropertyOptional()
    message_type?: string

    @IsString()
    @IsOptional(null)
    @ApiPropertyOptional()
    local_data_media?: string

    @IsString()
    @IsOptional(null)
    @ApiPropertyOptional()
    send_at?: string
}
