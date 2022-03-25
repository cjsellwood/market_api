import Joi from "joi";

export const registerSchema = Joi.object({
  username: Joi.string().min(4).max(32).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required(),
  password: Joi.string().min(8).max(64).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required(),
  password: Joi.string().min(8).max(64).required(),
});

export const newProductSchema = Joi.object({
  title: Joi.string().min(4).required(),
  category_id: Joi.number().min(1).max(7).required(),
  description: Joi.string().min(4).required(),
  price: Joi.number().min(0).max(1000000000).required(),
  location: Joi.string().min(3).required(),
});

export const updateProductSchema = Joi.object({
  title: Joi.string().min(4).required(),
  category_id: Joi.number().min(1).max(7).required(),
  description: Joi.string().min(4).required(),
  price: Joi.number().min(0).max(1000000000).required(),
  location: Joi.string().min(3).required(),
  updatedImages: Joi.string().required(),
});
