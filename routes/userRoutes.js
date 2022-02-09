const express = require("express");
const UserController = require("../controllers/UserController");
const router = express.Router();
const { celebrate, Joi } = require("celebrate");

// MIDDLEWARES
const verifyUserToken = require("../helpers/verify-user-token");
const Schemas = require("../helpers/celebrate-schemas");
const { imageUpload } = require("../helpers/image-upload");

router.post(
  "/register",
  celebrate(
    { body: Joi.object().keys(Schemas.registerSchema) },
    { abortEarly: false }
  ),
  UserController.register
);
router.post(
  "/login",
  celebrate(
    { body: Joi.object().keys(Schemas.loginSchema) },
    { abortEarly: false }
  ),
  UserController.login
);
router.get("/check", UserController.checkUser);
router.get("/:id", UserController.getUserById);
router.patch(
  "/edit/:id",
  celebrate(
    { body: Joi.object().keys(Schemas.updateSchema) },
    { abortEarly: false }
  ),
  verifyUserToken,
  imageUpload.single("image"),
  UserController.editUser
);
module.exports = router;
