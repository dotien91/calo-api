import { Catch, ExceptionFilter, HttpException, ArgumentsHost } from "@nestjs/common";
import { Request, Response } from 'express';

/**
 * Process Exception Filter in App Service
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        let message = exception.message;
        if (exception?.response) {
            message = exception?.response.message;
        }
        response
            .status(status)
            .json({
                statusCode: status,
                message: message,
                error: exception.name
            });
    }
}