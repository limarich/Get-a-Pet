const jwt = require("jsonwebtoken");

function createUserToken(user, req, res) {
  const token = jwt.sign(
    {
      name: user.name,
      id: user._id,
    },
    process.env.SECRET
  );
  //   return token
  res.status(200).json({
    message: "usuário autenticado",
    token: token,
    userId: user._id,
  });
}
module.exports = createUserToken;
