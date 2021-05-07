// route imports
const commentRoutes = require("./comments");
const userRoutes = require("./users");
const dashboardRoutes = require("./dashboard");
//

const constructorMethod = (app) => {
  app.use("/users", userRoutes);
  app.use("/comments", commentRoutes);
  app.use("/", dashboardRoutes);
  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
