const express = require("express");
const router = express.Router();
const xss = require("xss");
const e = require("express");
const bcrypt = require("bcryptjs");
const userFunctions = require("./../data/users");
const postFunctions = require("./../data/posts");


router.get("/:id/profile", async (req, res) => {
  // after user input right password and log in, they redirect to this router by way of router.post("/login")
  const id = xss(req.session.user.userId);
  const userInfo = await userFunctions.getUserById(id);
  const postList = await postFunctions.getPostsByUserId(id);
  
  for (let post of postList) {
    if (post.userId == req.session.user.userId) {
      post.user = true;
    }
    let numLikes = post.usersLiked.length;
      if(numLikes > 1){
        post.likeCount = `${numLikes} Likes`;
      }else{
        post.likeCount = `${numLikes} Like`;
      }
      post.isLiked = post.usersLiked.includes(req.session.user.userId);
  }
  // console.log(userInfo);
  // console.log(await postFunctions.getPostsByUserId(id))
  try {
    res.render("profile/profile", {
      title: `${userInfo.userName}`,
      partial: "profile_js_script",
      postItems: postList,
      USERNAME: userInfo.userName,
      MAJOR: userInfo.major,
      GRADYEAR: userInfo.gradYear,
      sessionUserId: req.session.user.userId,
      user: true,
    }); // for rendering text page
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

// router.get("/ids", async (req, res) => {
//   try {
//     let allUserIds = await userFunctions.getAllUserIds();
//     res.json(allUserIds);
//   } catch (e) {
//     res.status(404).json({ error: e.message });
//   }
// });

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
  // register.handlebars will post form to this router
  if (
    !req.body.userName ||
    !req.body.password ||
    !req.body.major ||
    !req.body.gradYear
  ) {
    res.status(404).json({ error: "Must supply all fields." });
    return;
  }

  const { userName, email, password, nickName, major, gradYear } = req.body;

  const errorList = [];
  if (!userName.trim()) errorList.push("userName is not valid");
  if (!email.trim()) errorList.push("Email is not valid");

  if (errorList.length > 0) {
    // user register form have empty field. I wonder because register.handlebars ask 'require' for each field, it seems it will not trigger this statement
    res.status(400).render("auth/register", {
      title: "register",
      partial: "register_check_script",
      userName: xss(userName),
      email: xss(email),
      password: xss(password),
      nickName: xss(nickName),
      major: xss(major),
      gradYear: gradYear,
      hasErrors: true,
      errors: errorList,
    });
  } else {
    // user fill out all field in register form, we can create an account for them
    var salt = bcrypt.genSaltSync(10);
    var hashedPw = await bcrypt.hash(password, salt);
    const inputData = {
      userName: xss(userName),
      email: xss(email),
      password: hashedPw,
      nickName: xss(nickName),
      major: xss(major),
      gradYear: xss(gradYear),
    };

    try {
      let newUser = await userFunctions.createUser(inputData); // create an account for user in user collection
      //res.json(newUser);
      res.render("auth/login", {
        title: "Login",
        partial: "login_check_script",
      }); // if user have signed in, we guide them to login page
    } catch (e) {
      // createUser() fail, render register.handlebars
      //console.log(e.message);
      //res.status(500).json({ error: e.message });
      console.log("createUser() fail, render register form");
      res.render("auth/register", {
        title: "register",
        partial: "register_check_script",
        error: e.message,
        userName: userName,
        email: email,
        password: password,
        nickName: nickName,
        major: major,
        gradYear: gradYear,
      });
    }
  }
});

router.delete("/:id", async (req, res) => {
  const id = xss(req.params.id);

  if (!id) {
    res.status(400).json({
      error: "User id is not valid. You must provide userId to delete",
    });
    return;
  }

  try {
    let deleted = await userFunctions.deleteUser(id);
    if (deleted) {
      res.json({ userId: id, deleted: "true" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
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

router.post("/login", async (req, res) => {
  if (req.session.isLogIn) res.redirect(`/user/${req.session.userId}/profile`); // if user already log in, when they go to login page, they should redirect profile page instead of seeing login form

  if (!req.body.email || !req.body.password) {
    res.status(404).json({ error: "Must supply all fields." });
    return;
  }
  const email = req.body.email;
  const password = req.body.password;
  let crtTimeStamp = new Date().toUTCString(); // current timestamp

  try {
    let userData = await userFunctions.getUserbyEmail(email);

    bcrypt.compare(password, userData.password, function (err, results) {
      if (results == true) {
        req.session.user = {
          //store current user info in session
          userId: userData._id,
          userName: userData.userName,
          email: userData.email,
          nickName: userData.nickName,
          major: userData.major,
          gradYear: userData.gradYear,
          courses: userData.courses,
          postId: userData.postId,
          commentId: userData.commentId,
        };
        // res.send({
        //   token: "12345",
        //   userData,
        // });
        req.session.isLogIn = true; // if user already logged in, when they go to login page, they should redirect profile page instead of seeing login form
        req.session.userId = userData._id; // this line is for 'if (req.session.isLogIn)'
        res.cookie("AuthCookie", userData.userName);
        console.log(
          `[${crtTimeStamp}]: ${req.method} ${req.originalUrl} (Authenticated User)`
        );
        res.redirect(`/auth`); // ❤ user input right password, we redirect them to user profile. I think it should be /user/:id/profile
      } //else res.status(404).send("Invalid Email/Password Combination");
      else {
        res.status(404).render("auth/login", {
          title: "login",
          partial: "login_check_script",
          error: "Invalid Email/Password Combination",
          email: email,
          password: password,
        });
        console.log(
          `[${crtTimeStamp}]: ${req.method} ${req.originalUrl} (Non-Authenticated User)`
        );
      }
    });
  } catch (e) {
    //res.status(404).json({ error: e.message });
    res.status(404).render("auth/login", {
      title: "login",
      partial: "login_check_script",
      error: "Invalid Email/Password Combination",
      email: email,
      password: password,
    });
  }
});

router.post("/like", async (req, res) => {

  if (!req.session.isLogIn){
    res.status(401);
    res.redirect('/auth');
    return;
  }

  if (!req.body.userId || !req.body.postId) {
    res.status(404).json({ error: "Must supply all fields." });
    return;
  }

  let userId = xss(req.body.userId);
  let postId = xss(req.body.postId);


  try{
    let updatedUser = await userFunctions.updateLikedPosts(userId, postId);
    res.status(200).json(updatedUser);
  }catch (e) {
    console.log(e);
    res.status(500).json({ error: e.message });
  }

});

module.exports = router;
