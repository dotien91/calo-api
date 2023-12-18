import { CreateChannelDomainDto } from "./create-channel-domain.dto";
import { PartialType } from '@nestjs/mapped-types';

export class CheckChannelDomainDto extends PartialType(CreateChannelDomainDto) {}