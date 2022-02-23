import { NextFunction, Request, Response } from "express";
import { registerSchema } from "./joi";
import StatusError from "./utils/StatusError";

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isValid = registerSchema.validate(req.body);
  if (isValid.error) {
    return next(new StatusError(isValid.error.message, 400));
  }
  next();
};
