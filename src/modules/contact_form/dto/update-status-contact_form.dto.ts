import { IsString } from "class-validator"

export class updateStatusContactForm {
  @IsString()
  _id: string

  @IsString()
  form_status: string
}
