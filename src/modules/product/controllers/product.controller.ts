import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateProductDTO, ListProductDTO, UpdateProductDTO } from "../dto/product.dto";
import { ProductHelper } from "../helper/product.helper";

@Controller("product")
export class ProductController {
  constructor(private readonly productHelper: ProductHelper) {}

  @Get("/list")
  async listProducts(@Query() query: ListProductDTO, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.productHelper.list(query, res, req);
  }

  @Get("/detail/:id")
  async detailProduct(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.productHelper.detail(id, res, req);
  }

  @Post("/create")
  async createProduct(@Body() createData: CreateProductDTO, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.productHelper.create(createData, res, req);
  }

  @Patch("/update")
  async updateProduct(@Body() updateData: UpdateProductDTO, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.productHelper.update(updateData, res, req);
  }

  @Delete("/:id")
  async deleteProduct(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.productHelper.delete(id, res, req);
  }
}

