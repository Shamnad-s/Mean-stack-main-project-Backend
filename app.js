const express = require("express");
const app = express();
require("dotenv/config");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const api = process.env.API_URL;

const usersRoutes = require("./routes/users");
const categoriesRoutes = require("./routes/categories");
const eventRoutes = require("./routes/events");
const expressJwt = require("express-jwt");
// const errorHandler = require("./helpers/error-handler");
function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      // { url: /\/api\/v1\/event(.*)/, methods: ["GET", "OPTIONS"] },
      // { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },

      // `${api}/users/login`,
      // `${api}/users/register`,
      { url: /(.*)/ },
    ],
  });
}

async function isRevoked(req, payload, done) {
  if (!payload.isAdmin) {
    done(null, true);
  }

  done();
}

// app.use(errorHandler)
app.use(morgan("tiny"));
app.use(bodyParser.json());
app.use(cors());
app.use(authJwt());
app.options("*", cors());
mongoose.set("strictQuery", false);

mongoose
  .connect(
    "mongodb+srv://Amien:shamnad123@cluster0.gului2c.mongodb.net/event-database?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "event-database",
    }
  )
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/event`, eventRoutes);
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    console.log(err);
    // jwt authentication error
    return res.status(401).json({ message: "The user is not authorized" });
  }

  if (err.name === "ValidationError") {
    //  validation error
    return res.status(401).json({ message: err });
  }

  // default to 500 server error
  return res.status(500).json(err);
});

// app.use(`${api}/orders`, ordersRoutes);
app.listen(3000, () => {
  console.log("server listening on port 3000");
});
