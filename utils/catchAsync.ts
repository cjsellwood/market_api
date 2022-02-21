import { NextFunction, Request, Response } from "express";
import StatusError from "./StatusError";

const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((error: StatusError) => next(error));
  };
};

export default catchAsync;
