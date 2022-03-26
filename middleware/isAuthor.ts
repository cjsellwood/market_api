import { NextFunction, Request, Response } from "express";
import { query } from "../db/db";
import catchAsync from "../utils/catchAsync";
import StatusError from "../utils/StatusError";

export default catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals;
    const { id } = req.params;

    const result = await query(
      `SELECT user_id FROM product
      WHERE product_id = $1`,
      [id]
    );

    if (!result.rows.length) {
      return next(new StatusError("Product not found", 404));
    }

    const author = result.rows[0].user_id;

    if (author !== userId) {
      return next(new StatusError("You are not the author", 401));
    }

    next();
  }
);
