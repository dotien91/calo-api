import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateChatRoomDto {
  @IsString()
  @IsOptional(null)
  user_id: string;

  @IsString()
  partner_id: string

  @IsIn(['personal', 'group', 'anonymous'])
  chat_type: 'personal' | 'group' | 'anonymous'

  @IsString()
  @IsOptional(null)
  room_name: string

  @IsNumberString()
  @IsOptional(null)
  is_payment: number
}
