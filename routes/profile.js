const express = require('express');
const router = express.Router();
const data = require('../data');
const xss = require("xss");
const userData = data.users;  // ../data/users.js
const postData = data.posts;  // ../data/posts.js
const commentData = data.comments;  // ../data/comments.js


router.get('/', async (req, res) => {
  let userId = xss(req.params.id)
  let userInfo = userData.getUserById(userId);

  try {
    res.render('profile/profile', {
      bootstrap4: true,
      courses: userInfo.courses,
      userPosts: postData.getPostsByUser(userId)
    });  // for rendering text page

    // // if I cannot get username, email etc. from req.session. I can use getUserById(userID) to get information as well
    // res.render('profile/profile', {
    //   userName: req.session.username,
    //   email: req.session.email,
    //   major: req.seesion.major,
    //   gradYear: req.seesion.gradYear,
    //   course: req.seesion.course,
    //   postCardProfile: userData.getAllPosts(),
    //   bootstrap4: true,  // trigger bootstrap4 version
    // });
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;