import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { CronExpression } from "@nestjs/schedule";
import { Response } from "express";
import { schedule } from "node-cron";
import Stripe from "stripe";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { OrderService } from "../../../modules/order/services/order.service";
import { CreatePurchaseAppleDto } from "../dto/create-purchase_apple.dto";
import { CreatePurchaseGoogleDto } from "../dto/create-purchase_google.dto";
import { PurchaseHelper } from "../helper/purchase.helper";
// import { OrderHelper } from "../../../modules/order/helper/OrderHelper";

@Controller("purchase")
export class PurchaseController {
  constructor(
    private readonly purchaseHelper: PurchaseHelper,
    private readonly orderService: OrderService
  ) // private readonly orderHelper: OrderHelper
  {
    this.handleProcessCron();
  }

  /**
   *
   * @param id
   * @param res
   * @param req
   * @returns
   */
  @Get("/stripe-key")
  async getStripeKey(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    return res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "" });
  }

  @Post("/create-payment-intent")
  async createPaymentIntent(@Body() dataCreate: any, @Res() res: Response, @Req() req: ExpressRequestDto) {
    const { currency, request_three_d_secure, payment_method_types = [] } = dataCreate;

    const userObject = req?.user_object;
    if (!userObject) {
      throw new ForbiddenException("User is invalid");
    }
    const email = userObject?.user_email?.toString();

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      //@ts-ignore
      apiVersion: "2022-11-15",
      typescript: true,
    });

    const customer = await stripe.customers.create({ email });

    const params = {
      amount: 5000,
      currency,
      customer: customer.id,
      payment_method_options: {
        card: {
          request_three_d_secure: request_three_d_secure || "automatic",
        },
      },
      payment_method_types: payment_method_types,
    };

    try {
      const paymentIntent = await stripe.paymentIntents.create(params);
      return res.send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      return res.send({
        error: error.raw.message,
      });
    }
  }

  @Post("/payment-sheet-setup-intent")
  async paymentSheetSetupIntent(@Body() dataCreate: any, @Res() res: Response, @Req() req: ExpressRequestDto) {
    const { payment_method_types = [] } = dataCreate;

    const userObject = req?.user_object;
    if (!userObject) {
      throw new ForbiddenException("User is invalid");
    }
    const email = userObject?.user_email?.toString();

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      //@ts-ignore
      apiVersion: "2022-11-15",
      typescript: true,
    });

    const customer = await stripe.customers.create({ email });

    const ephemeralKey = await stripe.ephemeralKeys.create({ customer: customer.id }, { apiVersion: "2020-08-27" });
    const setupIntent = await stripe.setupIntents.create({
      ...{ customer: customer.id, payment_method_types },
    });

    return res.json({
      setupIntent: setupIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  }

  @Post("/payment-sheet")
  async paymentSheet(@Body() dataCreate: any, @Res() res: Response, @Req() req: ExpressRequestDto) {
    // const { email = `test${Math.floor(Math.random() * 9999) + 1}@domain.com` } = dataCreate;
    const userObject = req?.user_object;
    if (!userObject) {
      throw new ForbiddenException("User is invalid");
    }
    const email = userObject?.user_email?.toString();

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      //@ts-ignore
      apiVersion: "2022-11-15",
      typescript: true,
    });

    const customer = await stripe.customers.create({ email });

    const ephemeralKey = await stripe.ephemeralKeys.create({ customer: customer.id }, { apiVersion: "2020-08-27" });
    const dataOrder = await this.orderService.findOne({ _id: dataCreate?.order_id });
    let price = 2000;
    if (dataOrder) {
      price = Number(dataOrder?.price) * 100;
      price = Math.round(price);
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price,
      currency: "usd",
      payment_method_types: ["card", "link"],
    });
    if (dataCreate?.order_id) {
      //Update order
      const dataUpdate = {
        _id: dataCreate?.order_id,
        client_secret: paymentIntent.client_secret,
      };
      await this.orderService.update(dataUpdate);
    }

    return res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  }

  @Post("/webhook")
  async paymentSheetSubscription(@Body() dataCreate: any, @Res() res: Response, @Req() req: ExpressRequestDto) {
    const endpointSecret = process.env.API_WEBHOOK_SECRET;
    let event = dataCreate;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = req.headers["stripe-signature"];
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        //@ts-ignore
        apiVersion: "2022-11-15",
        typescript: true,
      });
      try {
        console.log(req.rawBody, "req.rawBody");
        event = stripe.webhooks.constructEvent(req.rawBody, signature, endpointSecret);
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return res.sendStatus(400);
      }
    }
    const paymentMethod = event.data.object;

    const clientSecret = paymentMethod?.client_secret;
    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
        //Update Order ID;
        if (clientSecret) {
          const dataOrder = await this.orderService.findOne({ client_secret: clientSecret });
          if (dataOrder) {
            const dataUpdate = {
              _id: dataOrder?._id?.toString(),
              status: "success",
              payment_method: "stripe",
            };
            await this.orderService.update(dataUpdate);
            //Update order
            // await this.orderHelper.updateOrderAfter(dataOrder?._id?.toString());
          }
        }

        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "payment_method.attached":
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case "payment_intent.payment_failed":
        if (clientSecret) {
          const dataOrder = await this.orderService.findOne({ client_secret: clientSecret });
          if (dataOrder) {
            const dataUpdate = {
              _id: dataOrder?._id?.toString(),
              status: "close",
              payment_method: "stripe",
            };
            await this.orderService.update(dataUpdate);
          }
        }
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
    // Return a 200 response to acknowledge receipt of the event
    res.send();
  }

  // @Post("/payment-sheet-subscription")
  // async paymentSheetSubscription(@Body() dataCreate: any, @Res() res: Response, @Req() req: ExpressRequestDto) {
  //   const { email = `test${Math.floor(Math.random() * 9999) + 1}@domain.com` } = dataCreate;
  //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  //     apiVersion: "2022-11-15",
  //     typescript: true,
  //   });

  //   const customer = await stripe.customers.create({ email });

  //   const ephemeralKey = await stripe.ephemeralKeys.create({ customer: customer.id }, { apiVersion: "2020-08-27" });
  //   const PRICE_ID = "<YOUR PRICE ID HERE>";
  //   const subscription = await stripe.subscriptions.create({
  //     customer: customer.id,
  //     items: [{ price: PRICE_ID }],
  //     trial_period_days: 3,
  //   });

  //   if (typeof subscription.pending_setup_intent === "string") {
  //     const setupIntent = await stripe.setupIntents.retrieve(subscription.pending_setup_intent);

  //     return res.json({
  //       setupIntent: setupIntent.client_secret,
  //       ephemeralKey: ephemeralKey.secret,
  //       customer: customer.id,
  //     });
  //   } else {
  //     throw new Error("Expected response type string, but received: " + typeof subscription.pending_setup_intent);
  //   }
  // }

  @UsePipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
    })
  )
  @Post("/google")
  async createPurchaseGoogle(
    @Body() dataCreate: CreatePurchaseGoogleDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.purchaseHelper.createNewPurchaseGoogle(dataCreate, res, req);
  }

  /**
   * @author Tony Vu
   */
  async handleProcessCron() {
    const cronJob = schedule(CronExpression.EVERY_3_HOURS, async () => {
      try {
        // await this.bar();
        console.log("Start Cron Job Every 6 Hours");
        //this.purchaseHelper.handleCronJob();
      } catch (e) {
        console.error(e);
      }
    });
    // Start job
    // if (!cronJob.running) {
    //   cronJob.start();
    // }
    cronJob?.start();
  }

  @UsePipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
    })
  )
  @Post("/apple")
  async createPurchaseApple(
    @Body() dataCreate: CreatePurchaseAppleDto,
    @Res() res: Response,
    @Req() req: ExpressRequestDto
  ) {
    return await this.purchaseHelper.createNewPurchaseApple(dataCreate, res, req);
  }

  @Get("validate/:id")
  async validatePurchase(@Param("id") id: string, @Res() res: Response, @Req() req: ExpressRequestDto) {
    console.log(id);
    return await this.purchaseHelper.validatePurchase(id, res, req);
  }
}
