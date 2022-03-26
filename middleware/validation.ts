import { NextFunction, Request, Response } from "express";
import {
  loginSchema,
  registerSchema,
  newProductSchema,
  updateProductSchema,
} from "./joi";
import StatusError from "../utils/StatusError";
import Joi, { valid } from "joi";

const validate = (
  req: Request,
  res: Response,
  next: NextFunction,
  schema: Joi.ObjectSchema
) => {
  const isValid = schema.validate(req.body);
  if (isValid.error) {
    return next(new StatusError(isValid.error.message, 400));
  }
  next();
};

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  validate(req, res, next, registerSchema);
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  validate(req, res, next, loginSchema);
};

export const validateNewProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  validate(req, res, next, newProductSchema);
};

export const validateUpdateProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  validate(req, res, next, updateProductSchema);
};
