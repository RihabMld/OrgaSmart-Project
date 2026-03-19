const { param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.viewProfileByIdValidator = [
  param("id").isUUID().withMessage("Invalid user ID"),
  validatorMiddleware,
];
