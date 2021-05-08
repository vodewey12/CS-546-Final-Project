// route imports
const commentRoutes = require("./comments");
const userRoutes = require("./users");
const postRoutes = require("./posts");
//
const constructorMethod = (app) => {
  app.use("/users", userRoutes);
  app.use("/comments", commentRoutes);
  app.user("/posts", postRoutes);

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
