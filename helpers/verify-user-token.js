const jws = require("jsonwebtoken");
const getUserToken = require("./get-user-token");

const verifyUserToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  const token = getUserToken(req);
  if (!token) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  try {
    const verified = jws.verify(token, process.env.SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
};
module.exports = verifyUserToken;
