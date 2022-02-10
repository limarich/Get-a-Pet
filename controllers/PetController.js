const Pet = require("../models/Pet");
// MIDDLEWARES
const getUserToken = require("../helpers/get-user-token");
const getUserByToken = require("../helpers/get-user-by-token");
const ObjectId = require("mongoose").Types.ObjectId;
module.exports = class PetController {
  static async register(req, res) {
    const { name, age, weight, color } = req.body;
    const available = true;
    const images = req.files;
    if (!images) {
      return res.status(422).json({ message: "a imagem é obrigatória" });
    }
    if (!images.length === 0) {
      return res.status(422).json({ message: "a imagem é obrigatória" });
    }
    const token = getUserToken(req);
    const user = await getUserByToken(token);
    // PRECISA ATUALIZAR O USUARIO DENTRO DE PET QUANDO USUARIO FOR ALTERADO/ATUALIZADO
    const pet = new Pet({
      name,
      age,
      weight,
      color,
      images: [],
      available,
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    });
    images.map((image) => {
      pet.images.push(image.filename);
    });
    try {
      const newPet = await pet.save();
      return res.status(201).json({ message: "pet criado com sucesso" });
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  }
  static async getAll(req, res) {
    const pets = await Pet.find().sort("-createdAt");
    // RETURN ONLY AVAILABLE PETS
    let availablePets = [];
    pets.map((pet) => {
      if (pet.available) availablePets.push(pet);
    });
    return res.status(200).json({ pets: availablePets });
  }
  static async getPetsByUserId(req, res) {
    const token = getUserToken(req);
    const user = await getUserByToken(token);
    const pets = await Pet.find({ "user._id": user._id });
    return res.status(200).json({ pets });
  }
  static async getAdoptionsByUserId(req, res) {
    const token = getUserToken(req);
    const user = await getUserByToken(token);
    const pets = await Pet.find({ "adopter._id": user._id });
    return res.status(200).json({ pets });
  }
  static async getPetById(req, res) {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "Identificação de pet inválida" });
    }
    const pet = await Pet.findOne({ _id: id });
    if (!pet) {
      return res.status(404).json({ message: "pet não encontrado" });
    }
    res.status(200).json({ pet });
  }
  static async remove(req, res) {
    const { id } = req.params;
    //ID VALIDATION
    if (!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "Identificação de pet inválida" });
    }
    // PET SEARCH AND VALIDATION
    const pet = await Pet.findOne({ _id: id });
    if (!pet) {
      return res.status(404).json({ message: "pet não encontrado" });
    }
    //VERIFY IF USER LOGGED HAS THIS PET
    const token = getUserToken(req);
    const user = await getUserByToken(token);

    if (user._id.toString() !== pet.user._id.toString()) {
      return res.status(422).json({
        message: "hove um problema ao processar a solicitação, tente novamente",
      });
    }
    const deletedPet = await Pet.findByIdAndDelete(id);
    if (!deletedPet) {
      return res.status(500).json({
        message: "ocorreu algum erro inesperado, por favor tente novamente",
      });
    }
    return res.status(204).json();
  }
  static async updatePet(req, res) {
    const { name, age, weight, color, available } = req.body;
    const images = req.files;
    const { id } = req.params;
    //ID VALIDATION
    if (!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "Identificação de pet inválida" });
    }
    // PET SEARCH AND VALIDATION
    const pet = await Pet.findOne({ _id: id });
    if (!pet) {
      return res.status(404).json({ message: "pet não encontrado" });
    }
    let updatedData = {
      name,
      age,
      weight,
      color,
      available,
    };
    //VERIFY IF USER LOGGED HAS THIS PET
    const token = getUserToken(req);
    const user = await getUserByToken(token);

    if (user._id.toString() !== pet.user._id.toString()) {
      return res.status(422).json({
        message: "hove um problema ao processar a solicitação, tente novamente",
      });
    }
    if (images) {
      updatedData.images = [];
      if (images.length !== 0) {
        images.map((image) => {
          updatedData.images.push(image.filename);
        });
      }
    }
    await Pet.findByIdAndUpdate(id, updatedData);
    res.status(204).json();
  }
  static async schedule(req, res) {
    const { id } = req.params;
    //ID VALIDATION
    if (!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "Identificação de pet inválida" });
    }
    // PET SEARCH AND VALIDATION
    const pet = await Pet.findOne({ _id: id });
    if (!pet) {
      return res.status(404).json({ message: "pet não encontrado" });
    }
    //VERIFY IF USER LOGGED HAS THIS PET
    const token = getUserToken(req);
    const user = await getUserByToken(token);
    //CHECK IF USER ALREADY HAS THIS PET
    if (pet.user._id.equals(user._id)) {
      return res.status(422).json({
        message: "você não pode adotar o seu próprio pet",
      });
    }
    if (pet.adopter) {
      if (pet.adopter._id.equals(user.id)) {
        return res.status(422).json({
          message: "você já agendou essa adoção",
        });
      }
    }
    pet.adopter = {
      _id: user._id,
      name: user.name,
      image: user.image,
    };
    try {
      await Pet.findByIdAndUpdate(id, pet);
    } catch (err) {
      return res.status(500).json({
        message: "ocorreu algum erro inesperado, por favor tente novamente",
      });
    }
    res.status(204).json();
  }
  static async concludeAdoption(req, res) {
    const { id } = req.params;
    // PET SEARCH AND VALIDATION
    const pet = await Pet.findOne({ _id: id });
    if (!pet) {
      return res.status(404).json({ message: "pet não encontrado" });
    }
    //VERIFY IF USER LOGGED HAS THIS PET
    const token = getUserToken(req);
    const user = await getUserByToken(token);

    if (user._id.toString() !== pet.user._id.toString()) {
      return res.status(422).json({
        message: "hove um problema ao processar a solicitação, tente novamente",
      });
    }
    // UPDATE THE ADOPT STATUS
    pet.available = false;
    try {
      await Pet.findByIdAndUpdate(id, pet);
    } catch (err) {
      return res.status(500).json({
        message: "ocorreu algum erro inesperado, por favor tente novamente",
      });
    }
    return res.status(204).json();
  }
};
// atualizar os pets do usuário se apagar o pet
// atualizar o pet para não disponível
// send request
