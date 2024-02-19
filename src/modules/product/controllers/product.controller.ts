import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateProductDTO, ListProductDTO, UpdateProductDTO } from "../dto/product.dto";
import { ProductHelper } from "../helper/product.helper";
import { ProductReviewHelper } from "../helper/product_review.helper";
import {
  CreateProductReviewDto,
  ListProductReviewDto,
  UpdateProductReviewDto,
} from "../interfaces/product_review.interface";

@Controller("product")
export class ProductController {
  constructor(
    private readonly productHelper: ProductHelper,
    private readonly productReviewHelper: ProductReviewHelper
  ) {}

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

  @Get("list-review")
  async getProductReview(@Query() query: ListProductReviewDto, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.productReviewHelper.getProductReviewList(query, req, res);
  }

  @Post("create-review")
  async createNewReview(
    @Body() createReviewBody: CreateProductReviewDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.productReviewHelper.createNewReview(createReviewBody, req, res);
  }

  @Patch("update-review")
  async updateReview(
    @Body() updateReviewBody: UpdateProductReviewDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.productReviewHelper.updateReview(updateReviewBody, req, res);
  }

  @Delete("delete-review/:id")
  async deleteReview(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return await this.productReviewHelper.deleteReview(id, req, res);
  }
}

