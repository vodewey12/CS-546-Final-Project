const commentRoutes = require("./comments");
const userRoutes = require("./users");
const authRoutes = require("./auth");
const postRoutes = require("./posts");
const data = require("../data");
const userData = data.users; // ../data/users.js
const postData = data.posts; // ../data/posts.js
const commentData = data.comments; // ../data/comments.js

const constructorMethod = (app) => {
  app.use("/user", userRoutes);
  app.use("/comments", commentRoutes);
  app.use("/posts", postRoutes);
  app.use("/auth", authRoutes);
  app.get("/logout", async (req, res) => {
    // trigger /logout router to logout
    res.clearCookie("AuthCookie");
    res.clearCookie("Build Session");
    req.session.destroy();
    res.status(200).redirect("/auth");
  });

  app.use("/", async (req, res) => {
    res.redirect("/auth");
  });

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
