const router = require("express").Router();
const PetController = require("../controllers/PetController");
const { celebrate, Joi } = require("celebrate");
// MIDDLEWARES
const verifyUserToken = require("../helpers/verify-user-token");
const Schemas = require("../helpers/celebrate-schemas");
const { imageUpload } = require("../helpers/image-upload");

router.post(
  "/register",
  verifyUserToken,
  celebrate(
    { body: Joi.object().keys(Schemas.petSchema) },
    { abortEarly: false }
  ),
  imageUpload.array("images"),
  PetController.register
);
router.get("/", PetController.getAll);
router.get("/mypets", verifyUserToken, PetController.getPetsByUserId);
router.get("/myadoptions", verifyUserToken, PetController.getAdoptionsByUserId);
router.get("/:id", PetController.getPetById);
router.delete("/remove/:id", verifyUserToken, PetController.remove);
router.patch(
  "/update/:id",
  verifyUserToken,
  celebrate(
    { body: Joi.object().keys(Schemas.updatePetSchema) },
    { abortEarly: false }
  ),
  imageUpload.array("images"),
  PetController.updatePet
);
router.patch("/schedule/:id", verifyUserToken, PetController.schedule);
router.patch("/adoption/:id", verifyUserToken, PetController.concludeAdoption);
module.exports = router;
