const Joi = require("joi");
const ApiError = require("../utils/ApiError");

exports.validateOrder = (req, res, next) => {
  const schema = Joi.object({
    product: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
    deliveryAddress: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return next(new ApiError(400, error.details[0].message));

  next();
};
