const express = require("express");
const router = express.Router();
const userFunctions = require("./../data/users");
const xss = require("xss");
const e = require("express");
const bcrypt = require("bcryptjs");
const postFunctions = require("./../data/posts");

router.get("/", async (req, res) => {
  try {
    res.render("profile/profile"); // for rendering text page
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


router.post("/create", async (req, res) => {  // register.handlebars will post form to this router
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

  const { username, email, password , nickName , major, gradYear } = req.body;

  const errorList = [];
  if (!username.trim()) errorList.push("userName is not valid");
  if (!email.trim()) errorList.push("Email is not valid");

  if (errorList.length > 0) {  // user register form have empty field. I wonder because register.handlebars ask 'require' for each field, it seems it will not trigger this statement
    res.status(400).render('pages/register',{
      title: 'register',
      partial: 'register_check_script',
      userName: xss(username),
      email: xss(email),
      password: xss(password),
      nickName: xss(nickName),
      major: xss(major),
      gradYear: gradYear,
      hasErrors: true,
      errors: errorList
    });
  } 
  else {  // user fill out all field in register form, we can create an account for them
    var salt = bcrypt.genSaltSync(10);
    var hashedPw = await bcrypt.hash(password, salt);
    const inputData = {
      userName: xss(username),
      email: xss(email),
      password: hashedPw,
      nickName: xss(nickName),
      major: xss(major),
      gradYear: xss(gradYear),
    };

    try {
      let newUser = await userFunctions.createUser(inputData);  // create an account for user in user collection
      //res.json(newUser);
      res.render('pages/login' , {title: 'Login', partial: 'login_check_script'});  // if user have signed in, we guide them to login page 
    } catch (e) {  // createUser() fail, render register.handlebars
      //console.log(e.message);
      //res.status(500).json({ error: e.message });
      console.log('createUser() fail, render register form');
      res.render('pages/register' , {
        title: 'register',
        partial: 'register_check_script',
        error: e.message,
        userName:username,
        email:email,
        password:password,
        nickName:nickName,
        major:major,
        gradYear:gradYear
      });
    }
  }
});


router.delete("/:id", async (req, res) => {
  const id = xss(req.params.id);

  if (!id) {
    res.status(400).json({ error: "User id is not valid. You must provide userId to delete" });
    return;
  }

  try {
    let deleted = await userFunctions.deleteUser(id);
    if (deleted) {
      res.json({ 'userId': id, deleted: "true" });
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
  let crtTimeStamp = new Date().toUTCString();  // current timestamp

  try {
    let userData = await userFunctions.getUserbyEmail(email);

    bcrypt.compare(password, userData.password, function (err, results) {
      if (results == true) {
        req.session.user = {
          userId : userData._id, 
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
        res.cookie('AuthCookie', userData.userName);  
        console.log(`[${crtTimeStamp}]: (Authenticated User)`);
        res.redirect('/profile');  // ❤ user input right password, we redirect them to user profile
      } //else res.status(404).send("Invalid Email/Password Combination");
      else{
        res.status(404).render('pages/login' , {
          title: 'login',
          partial: 'login_check_script',
          error : "Invalid Email/Password Combination",
          email: email,
          password : password
        });
        console.log(`[${crtTimeStamp}]: (Non-Authenticated User)`)
      }
    });
  } catch (e) {
    //res.status(404).json({ error: e.message });
    res.status(404).render('pages/login' , {
      title: 'login',
      partial: 'login_check_script',
      error : "Invalid Email/Password Combination",
      email: email,
      password : password
    });
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
