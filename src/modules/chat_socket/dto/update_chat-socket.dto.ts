import { PartialType } from "@nestjs/mapped-types";
import { CreateChatSocketDto } from "./create_chat-socket.dto";

export class UpdateChatSocketDto extends PartialType(CreateChatSocketDto) {}
