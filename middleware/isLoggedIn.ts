import { NextFunction, Request, Response } from "express";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import StatusError from "../utils/StatusError";

export default (req: Request, res: Response, next: NextFunction) => {
  // Get token from authorization header
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next(new StatusError("You are not logged in", 401));
  }
  const token = authorization.split(" ")[1];

  try {
    // Check jwt for validity and expiration
    const isValid = jsonwebtoken.verify(token, process.env.JWT_PRIVATE!);
    const payload = isValid as JwtPayload;
    res.locals.userId = Number(payload.sub);
  } catch (error) {
    return next(new StatusError("You are not logged in", 401));
  }

  next();
};
