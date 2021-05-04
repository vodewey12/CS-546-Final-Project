// route imports
<<<<<<< HEAD
const commentRoutes = require("./comments");
=======
const commentRoutes = require('./comments');
>>>>>>> 65d05a001b68e9ce7ae8c374de524c931d933499
const userRoutes = require("./users");

//
const constructorMethod = (app) => {
  app.use("/users", userRoutes);
<<<<<<< HEAD
  app.use("/comments", commentRoutes);
  app.use("*", (req, res) => {
    res.sendStatus(404);
=======
  app.use('/comments', commentRoutes);
  
  app.use('*', (req, res) => {
      res.sendStatus(404);
>>>>>>> 65d05a001b68e9ce7ae8c374de524c931d933499
  });
};

module.exports = constructorMethod;
