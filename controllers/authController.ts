import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { query } from "../db/db";
import { compare, hash } from "bcrypt";
import { DatabaseError } from "pg";
import StatusError from "../utils/StatusError";
import issueJWT from "../utils/issueJWT";

export const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    const hashedPassword = await hash(password, 12);
    try {
      const response = await query(
        `INSERT INTO app_user(username, email, password, joined) VALUES ($1, $2, $3, $4) RETURNING user_id;`,
        [username, email, hashedPassword, new Date(Date.now())]
      );

      const userId = response.rows[0].user_id;
      const jwt = issueJWT(userId);

      res.json({
        username,
        email,
        userId,
        token: jwt.token,
        expiresIn: jwt.expiresIn,
      });
    } catch (error) {
      const dbError = error as DatabaseError;

      // Handle key not being unique
      const key = dbError.constraint!.split("_")[2];
      if (dbError.code === "23505") {
        return next(new StatusError(`${key} already exists`, 400));
      }
    }
  }
);
