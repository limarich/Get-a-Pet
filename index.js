const express = require("express");
const cors = require("cors");
const { errors } = require("celebrate");

const app = express();

// CONFIG JSON RESPONSE
app.use(express.json());

// SOLVE CORS
app.use(cors({ credentials: true, origin: "https://localhost:3000" }));

// PUBLIC FOLDER FOR IMAGES
app.use(express.static("public"));

// ROUTES
const UserRoutes = require("./routes/userRoutes");
// const petsRoutes = require("../routes/petRoutes");

app.use("/users", UserRoutes);
// app.use(petsRoutes);
app.use(errors());
app.listen(5000);
