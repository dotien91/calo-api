import { ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { Permissions } from "../../../decorators/auth.decorator";
import { UserRoles } from "../../user/interfaces/user.interface";
import { CreateTrackingDto } from "../dto/create-tracking.dto";
import { ListMyBodyTrackingDto } from "../dto/list-my-body-tracking.dto";
import { ListTrackingDto } from "../dto/list-tracking.dto";
import { TrackingService } from "../services/tracking.service";

/**
 * @author Tony Vu
 * @class TrackingHelper
 */
@Injectable()
export class TrackingHelper {
  constructor(private readonly trackingService: TrackingService) {}

  private toStartOfDay(d: Date) {
    const x = new Date(d);
    x.setUTCHours(0, 0, 0, 0);
    return x;
  }

  private toEndOfDay(d: Date) {
    const x = new Date(d);
    x.setUTCHours(23, 59, 59, 999);
    return x;
  }

  /**
   * @author Tony Vu
   * @param createData
   * @param res
   * @param req
   * @returns
   */
  async createTracking(createData: CreateTrackingDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      const payload: any = { ...createData, user_id: userId };
      if (createData.tracked_at) {
        payload.tracked_at = new Date(createData.tracked_at);
      }
      const dataReturn = await this.trackingService.create(payload);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param res
   * @param req
   * @returns
   */
  async getListByAdmin(query: ListTrackingDto, res: Response, req: ExpressRequestDto) {
    try {
      const page = Number(query?.page) || 1;
      const limit = Number(query?.limit) || 20;
      const sortBy = query?.order_by ? { createdAt: query.order_by } : null;
      const filter = {
        user_id: query?.user_id,
        type: query?.type,
        metric: query?.metric,
      };
      const [data, total] = await Promise.all([
        this.trackingService.filter(filter, sortBy, page, limit),
        this.trackingService.count(filter),
      ]);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .header("X-Total-Count", String(total))
        .status(HttpStatus.OK)
        .json(data);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * Lấy danh sách tracking body của chính user (type = body)
   */
  async getMyBodyTracking(query: ListMyBodyTrackingDto, res: Response, req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      const userId = userObject._id.toString();
      const page = Number(query?.page) || 1;
      const limit = Number(query?.limit) || 20;
      const sortBy = query?.order_by ? { createdAt: query.order_by } : null;

      const tracked_from = query?.date_from ? this.toStartOfDay(new Date(query.date_from)) : undefined;
      const tracked_to = query?.date_to ? this.toEndOfDay(new Date(query.date_to)) : undefined;
      const filter = {
        user_id: userId,
        type: "body",
        metric: query?.metric,
        tracked_from,
        tracked_to,
      };
      const [data, total] = await Promise.all([
        this.trackingService.filter(filter, sortBy, page, limit),
        this.trackingService.count(filter),
      ]);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .header("X-Total-Count", String(total))
        .status(HttpStatus.OK)
        .json(data);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
