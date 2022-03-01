import { Request, Response, NextFunction } from "express";
import { query } from "../db/db";
import catchAsync from "../utils/catchAsync";

export const randomProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await query(
      `SELECT * FROM product ORDER BY random() LIMIT 20`,
      []
    );
    res.json(result.rows);
  }
);
