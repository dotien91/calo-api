import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateContactFormDto } from "../dto/create-contact_form.dto";
import { ListContactFormDto } from "../dto/list-contact_form.dto";
import { UpdateContactFormDto } from "../dto/update-contact_form.dto";
import { updateStatusContactForm } from "../dto/update-status-contact_form.dto";
import { ContactFormHelper } from "../helper/contact_from.helper";

@Controller("contact-form")
export class ContactFormController {
  constructor(private readonly contactFormHelper: ContactFormHelper) {}

  @Post("/create")
  async createNewContactForm(
    @Body() createContactFormData: CreateContactFormDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.contactFormHelper.createContactForm(createContactFormData, res, req);
  }

  @Patch("/update")
  async updateContactForm(
    @Body() updateContactFormData: UpdateContactFormDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.contactFormHelper.updateContactForm(updateContactFormData, res, req);
  }

  @Patch("/update-status")
  async updateStatusContactForm(
    @Body() updateStatusContactForm: updateStatusContactForm,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.contactFormHelper.updateStatusContactForm(updateStatusContactForm, res, req);
  }

  @Get("/user/:id")
  async getSubscribe(
    @Query() query: ListContactFormDto,
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.contactFormHelper.getContactFormByUserId(query, id, res, req);
  }

  @Get("/list-admin")
  async getListUserSubscribe(@Query() query: ListContactFormDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.contactFormHelper.getAllContactFormByAdmin(query, res, req);
  }

  @Delete("delete-contact-form/:id")
  async removeContactForm(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.contactFormHelper.removeContactForm(id, res, req);
  }

  @Get("detail/:id")
  async handleGetDetailContactForm(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.contactFormHelper.handleGetDetailContactForm(id, res, req);
  }
}
