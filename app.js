const express = require("express");
const app = express();
const configRoutes = require("./routes");
const moment = require("moment");
const Handlebars = require("handlebars");

const exphbs = require("express-handlebars");
const session = require("express-session");

const handlebarsInstance = exphbs.create({
  defaultLayout: "main",

  // Specify helpers which are only registered on this instance.
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === "number")
        return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

      return new Handlebars.SafeString(JSON.stringify(obj));
    },

    formattedDate: function (date) {
      return moment(date).format("MMM DD, YYYY");
    },
  },
  partialsDir: ["views/partials/"],
});

app.use("/public", express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine("handlebars", handlebarsInstance.engine);
app.set("view engine", "handlebars");

// Middlewares

app.use(
  session({
    name: "Build Session",
    secret: "some secret string!",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/user/:id", (req, res, next) => {
  // update user themself information
  if (req.method == "POST") {
    req.method = "PATCH";
  }
  next();
});

app.use("/posts/:id", (req, res, next) => {
  // user submit form to update their post
  // console.log(req);
  if (req.method == "POST") {
    req.method = "PATCH";
  }
  next();
});

app.use("/comments/markSol", (req, res, next) => {
  // user click button to mark comments as solution
  if (req.method == "POST") {
    req.method = "PATCH";
  }
  next();
});

app.use("/comments/upvote", (req, res, next) => {
  // user click button to upvote comments
  if (req.method == "POST") {
    req.method = "PATCH";
  }
  next();
});

app.use("/comments/downvote", (req, res, next) => {
  // user click button to downvote comments
  if (req.method == "POST") {
    req.method = "PATCH";
  }
  next();
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000/auth");
});
