// file: ../middlewares/check-document-size.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class CheckDocumentSizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const document = req.body;
    const documentSize = JSON.stringify(document).length;

    if (documentSize <= 102400) {
      next();
    } else {
      res.status(400).json({ message: "The document you post is too large, please try again!" });
    }
  }
}
