const commentRoutes = require("./comments");
const userRoutes = require("./users");
const authRoutes = require("./auth");
const postRoutes = require("./posts");

const constructorMethod = (app) => {
  app.use("/user", userRoutes);
  app.use("/comments", commentRoutes);
  app.use("/posts", postRoutes);
  app.use("/auth", authRoutes);
  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
