import { IsDefined, IsString } from "class-validator";

export class InvitationCodeBody {
  @IsString()
  @IsDefined()
  invitation_code: string;
}

