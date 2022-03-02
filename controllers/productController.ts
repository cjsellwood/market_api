import { Request, Response, NextFunction } from "express";
import { query } from "../db/db";
import catchAsync from "../utils/catchAsync";
import StatusError from "../utils/StatusError";

export const randomProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await query(
      `SELECT * FROM product ORDER BY random() LIMIT 20`,
      []
    );
    res.json(result.rows);
  }
);

export const singleProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await query(
      `SELECT product_id, title, description, price, images, listed, location, app_user.username, category.name as category FROM product 
      JOIN category ON product.category_id = category.category_id
      JOIN app_user ON product.user_id = app_user.user_id
        WHERE product_id = $1`,
      [id]
    );

    if (!result.rows.length) {
      return next(new StatusError("Product not found", 404));
    }

    const product = result.rows[0];
    res.json(product);
  }
);
