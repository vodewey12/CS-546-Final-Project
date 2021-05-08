const commentRoutes = require("./comments");
const userRoutes = require("./users");
const postRoutes = require("./posts");
const profileRoutes = require("./profile");
const dashboardRoutes = require("./dashboard");

const constructorMethod = (app) => {
  app.use("/users", userRoutes);
  app.use("/comments", commentRoutes);
  app.use("/posts", postRoutes);
  app.use("/profile", profileRoutes); // need this router to show user profile
  app.use("/dashboard", dashboardRoutes);
  app.use("/", profileRoutes);
  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
