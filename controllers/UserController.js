const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// HELPERS
const createUserToken = require("../helpers/create-user-token");
const getUserToken = require("../helpers/get-user-token");
const getUserByToken = require("../helpers/get-user-by-token");

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, password, confirmPassword, phone } = req.body;
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      res.status(422).json({
        message:
          "Email já cadastrado, por favor informe outro ou tente fazer login",
      });
      return;
    }
    if (password !== confirmPassword) {
      res.status(422).json({
        message: "As senhas precisam ser iguais!",
      });
      return;
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPass = await bcrypt.hash(password, salt);
    const user = new User({
      name,
      email,
      phone,
      password: hashedPass,
    });

    try {
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
    } catch (error) {
      res.status(500).json({
        message: error,
      });
    }
  }
  static async login(req, res) {
    const { email, password } = req.body;
    // CHECK EMAIL
    const userExists = await User.findOne({ email: email });
    if (!userExists) {
      res.status(422).json({ message: "email/senha incorretos" });
      return;
    }
    // CHECK PASSWORD
    const checkPassword = await bcrypt.compare(password, userExists.password);
    if (!checkPassword) {
      res.status(422).json({ message: "email/senha incorretos" });
      return;
    }
    await createUserToken(userExists, req, res);
  }
  static async checkUser(req, res) {
    let currentUser;
    if (req.headers.authorization) {
      const token = await getUserToken(req);
      const decoded = jwt.verify(token, process.env.SECRET);
      currentUser = await User.findById(decoded.id);
      currentUser.password = undefined;
    } else {
      currentUser = null;
    }
    res.status(200).send(currentUser);
  }
  static async getUserById(req, res) {
    // CELEBRATE VALIDATION
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(422).json({ message: "Usuário não encontrado" });
    }
    res.status(200).json(user);
  }
  static async editUser(req, res) {
    const { id } = req.params;
    // VERIFY IF USER EXISTS
    const token = getUserToken(req);
    const user = await getUserByToken(token);

    const { name, email, phone, password, confirmPassword } = req.body;

    // SAVE IMAGE IF EXISTS
    if (req.file) {
      user.image = req.file.filename;
    }

    const emailExists = await User.findOne({ email: email });
    if (user.email != email && emailExists) {
      return res.status(422).json({ message: "Por favor use outro email" });
    }
    if (!user) {
      return res.status(422).json({ message: "Usuário não encontrado" });
    }
    if (password != confirmPassword) {
      return res.status(422).json({ message: "As senhas não conferem" });
    }
    //GENERATE PASSWORD
    const salt = await bcrypt.genSalt(12);
    const hashedPass = await bcrypt.hash(password, salt);

    // SAVE USER INFORMATIONS
    user.name = name;
    user.phone = phone;
    user.password = hashedPass;
    try {
      await User.findByIdAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );
      return res.status(204).json();
    } catch (err) {
      res.status(500).json(err);
    }
  }
};
