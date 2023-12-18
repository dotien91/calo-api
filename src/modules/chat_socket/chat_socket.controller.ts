import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatSocketService } from './chat_socket.service';
import { CreateChatSocketDto } from './dto/create_chat-socket.dto';
import { UpdateChatSocketDto } from './dto/update_chat-socket.dto';

@Controller('chat-socket')
export class ChatSocketController {
  constructor(private readonly chatSocketService: ChatSocketService) {}
}
