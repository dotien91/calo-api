import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CouponService } from "../../../modules/coupon/services/coupon.service";
import { HandleServiceService } from "../../../modules/plan/services/handle_service.service";
import { PlanService } from "../../../modules/plan/services/plan.service";
import { ShopService } from "../../../modules/shop/services/shop.service";
import { CreateProductDTO, ListProductDTO, UpdateProductDTO } from "../dto/product.dto";
import { Product } from "../schemas/product.schema";
import { ProductService } from "../services/product.service";

@Injectable()
export class ProductHelper {
  constructor(
    private productService: ProductService,
    private handleServiceService: HandleServiceService,
    private planService: PlanService,
    private couponService: CouponService,
    private shopService: ShopService
  ) {}

  async list(body: ListProductDTO, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(body.limit) > 1000) {
        body.limit = 1000;
      }

      let limit = body.limit ? body.limit : 1000;
      let page = body.page ? body.page : 1;

      let orderByObject = {};
      // if (body.sort_by) orderByObject[body.sort_by] = body.order_by || "ASC";

      let dataToFilter = { ...body };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      // delete dataToFilter.order_by;
      // delete dataToFilter.sort_by;

      //Check Video View
      let dataReturn: any = await this.productService.filter(dataToFilter, orderByObject, page, limit);
      let count: any = await this.productService.count(dataToFilter);

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": count })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async detail(id: string, res: Response, req: ExpressRequestDto) {
    try {
      const product = await this.productService.findOne({ _id: id });
      if (!product) throw new Error("Not found product");

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(product);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async create(createData: CreateProductDTO, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) throw new Error("Invalid user");

      const shop = await this.shopService.findOne({ user_id: userObject._id.toString() });
      if (!shop) throw new Error("You don't own any shop yet");

      createData = { ...createData, ...{ shop_id: shop._id.toString(), user_id: userObject._id.toString() } };
      let dataCreate: any = await this.productService.create(createData);

      if (dataCreate?.price) {
        dataCreate = await this.handleUpdateServiceProduct(dataCreate);
      }

      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async update(dataUpdate: UpdateProductDTO, res: Response, req: ExpressRequestDto) {
    try {
      let dataCreate: any = await this.productService.update(dataUpdate);
      if (dataCreate?.price && !dataCreate?.service_id) {
        dataCreate = await this.handleUpdateServiceProduct(dataCreate);
      }
      if (dataCreate?.price && dataCreate?.service_id) {
        await this.handleUpdatePlan(dataCreate);
      }
      if (!Number(dataCreate?.price) && dataCreate?.service_id) {
        //Update service
        let dataUpdate = {
          service_id: null,
          plan_id: null,
          _id: dataCreate?._id?.toString(),
        };
        await this.productService.update(dataUpdate);
      }
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataCreate);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async delete(id: string, res: Response, req: ExpressRequestDto) {
    try {
      let dataReturn = await this.productService.remove(id);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleUpdateServiceProduct(productData: Product) {
    try {
      //Check Service
      let dataServiceToAdd = {
        handle: productData?._id?.toString(),
        title: productData?.name?.toString(),
        description: productData?.description?.toString(),
        avatar: productData?.media_id?._id?.toString(),
        long_description: productData?.long_description?.toString(),
        service_type: "product",
        is_show_side_bar: false,
        router_link: "r/product/view/" + productData?._id,
      };
      let serviceData = await this.handleServiceService.create(dataServiceToAdd);
      if (serviceData) {
        const price = productData?.coupon_id
          ? this.couponService.getPrice(Number(productData.price), productData.coupon_id as any)
          : Number(productData?.price);

        let dataPlanCreate = {
          service_id: serviceData?._id?.toString(),
          name: productData?.name?.toString(),
          price,
          amount_of_day: 365,
          trial_day: 0,
          amount_of_coin: 365,
          description: productData?.description?.toString(),
          type: "one_time",
          image: productData?.media_id?.media_url?.toString(),
          country: "VN",
          version: "1.0.1",
          ref_id: productData?._id?.toString(),
          google_store_product_id: "",
          user_id: productData.user_id.toString(),
        };
        let planService = await this.planService.create(dataPlanCreate);

        if (planService) {
          let dataUpdate = {
            _id: productData?._id?.toString(),
            service_id: serviceData?._id?.toString(),
            plan_id: planService?._id?.toString(),
          };
          let dataReturn = await this.productService.update(dataUpdate);
          return dataReturn;
        }
      }
      return {};
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  async handleUpdatePlan(productData: Product) {
    try {
      const price = productData?.coupon_id
        ? this.couponService.getPrice(Number(productData.price), productData.coupon_id as any)
        : Number(productData?.price);

      let dataPlanCreate = {
        _id: productData?.plan_id?.toString(),
        service_id: productData?.service_id.toString(),
        name: productData?.name?.toString(),
        price,
        amount_of_day: 365,
        trial_day: 0,
        amount_of_coin: 365,
        description: productData?.description?.toString(),
        type: "one_time",
        image: productData?.media_id?.media_url?.toString(),
        country: "VN",
        version: "1.0.1",
        ref_id: productData?._id?.toString(),
        google_store_product_id: "",
        user_id: productData.user_id.toString(),
      };
      await this.planService.update(dataPlanCreate);
      return {};
    } catch (error) {
      console.log(error);
      return {};
    }
  }
}

