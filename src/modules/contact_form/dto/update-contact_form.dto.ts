import { PartialType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { CreateContactFormDto } from "./create-contact_form.dto";

export class UpdateContactFormDto extends PartialType(CreateContactFormDto) {
  @IsString()
  @IsOptional(null)
  _id?: string;
}
