import { PartialType } from "@nestjs/swagger";
import { CreateContactFormDto } from "./create-contact_form.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdateContactFormDto extends PartialType(CreateContactFormDto) {
  @IsString()
  @IsOptional(null)
  _id?: string;
}
