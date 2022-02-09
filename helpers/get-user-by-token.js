const User = require("../models/User");
const jwt = require("jsonwebtoken");

const getUserByToken = async (token) => {
  const decoded = await jwt.decode(token, process.env.SECRET);
  const userId = decoded.id;
  const user = await User.findOne({ _id: userId });
  return user;
};
module.exports = getUserByToken;
