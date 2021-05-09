const express = require('express');
const router = express.Router();
const data = require('../data');
const xss = require("xss");
const userData = data.users;  // ../data/users.js
const postData = data.posts;  // ../data/posts.js
const commentData = data.comments;  // ../data/comments.js


router.get('/', async (req, res) => {
  let userId = xss(req.session.user.userId)
  let userInfo = userData.getUserById(userId);

  try {
    res.render('profile/profile', {
      bootstrap4: true,  // trigger bootstrap4 in main.handlebars
      courses: userInfo.courses,
      userPosts: postData.getPostsByUser(userId),
      logoutLink: 'http://localhost:3000/logout'
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
    res.status(403).render('pages/register', {error: true});
  }
});

module.exports = router;