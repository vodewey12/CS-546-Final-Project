const express = require("express");
const router = express.Router();
const userFunctions = require("./../data/users");
const xss = require("xss");
const e = require("express");
const bcrypt = require("bcryptjs");
const userFunctions = require("./../data/users");
const postFunctions = require("./../data/posts");

router.get("/", async (req, res) => {
  try {
    let allUsersPosts = await userFunctions.getPostsByUser(id);
    res.render("profile/profile", {
      results: allUsersPosts,
    }); // for rendering text page
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

router.get("/ids", async (req, res) => {
  try {
    let allUserIds = await userFunctions.getAllUserIds();
    res.json(allUserIds);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  const id = xss(req.params.id);
  if (!id) {
    res.status(400).json({ error: "User is is not valid" });
    return;
  }

  try {
    let user = await userFunctions.getUserById(id);
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

router.post("/create", async (req, res) => {
  if (
    !req.body ||
    !req.body.username ||
    !req.body.password ||
    !req.body.major ||
    !req.body.gradYear
  ) {
    res.status(404).json({ error: "Must supply all fields." });
    return;
  }

  const { username, email, major, password, gradYear } = req.body;
  const error = [];
  if (!username) error.push("userName is not valid");
  if (!email) error.push("Email is not valid");

  if (error.length > 0) {
    res.status(400).json({ error: error });
  } else {
    var salt = bcrypt.genSaltSync(10);
    var hashedPw = await bcrypt.hash(password, salt);
    const inputData = {
      username: xss(username),
      email: xss(email),
      password: hashedPw,
      major: xss(major),
      gradYear: xss(gradYear),
    };

    try {
      let newUser = await userFunctions.createUser(inputData);
      res.json(newUser);
    } catch (e) {
      console.log(e.message);
      res.status(500).json({ error: e.message });
    }
  }
});

router.delete("/:id", async (req, res) => {
  const id = xss(req.params.id);

  if (!id) {
    res.status(400).json({ error: "User id is not valid" });
    return;
  }

  try {
    let deleted = await userFunctions.deleteUser(id);
    if (deleted) {
      res.json({ deleted: "true" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(404).json({ error: "Must supply all fields." });
    return;
  }
  const email = req.body.email;
  const password = req.body.password;
  try {
    let userData = await userFunctions.getUserbyEmail(email);

    bcrypt.compare(password, userData.password, function (err, results) {
      if (results == true) {
        res.send({
          token: "12345",
          userData,
        });
      } else res.status(404).send("Invalid Email/Password Combination");
    });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

// update user
router.patch("/:id", async (req, res) => {
  const id = xss(req.params.id);
  const updatedUserData = req.body;
  if (!id || !updatedUserData || Object.keys(updatedUserData).length === 0) {
    res.status(400).json({
      error: "Must provide at least one field in request body.",
    });
    return;
  }

  try {
    await userFunctions.getUserById(id);
  } catch (e) {
    res.status(404).json({ error: e.message });
    return;
  }

  let error = [];

  if (updatedUserData.userName && !updatedUserData.userName)
    error.push("Updated user name is not valid");

  if (error.length > 0) {
    res.status(400).json({ error: error });
  } else {
    try {
      const newData = {};

      newData.userName = xss(updatedUserData.userName);

      let updatedUser = await userFunctions.updateUser(id, newData);
      res.status(200).json(updatedUser);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
});

module.exports = router;
