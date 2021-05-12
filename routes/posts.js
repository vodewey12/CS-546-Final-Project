const express = require("express");
const router = express.Router();
const data = require("../data");
const xss = require("xss");
const postData = data.posts;
const userData = data.users;

router.get("/", async (req, res) => {  // ❤ dashboard
  try {
    const postList = await postData.getAllPosts();
    res.render('dashboard/dashboard', {title:'dashboard', partial: 'dashboard_js_script', postItems: await postData.getAllPosts(), userId: req.session.user.userId })  //(lecture_11 code index.js) partial at here only for passing in client side Javascript of /public/js/dashboard.js
    // res.render("dashboard/dashboard", { results: postList });  // if use { results: postList } pass 'results' in postCards.handlebars, we should put postCards.handlebars entirely into /views/dashboard/dashboard.handlebars, instead of putting it into partials. In this way, we maybe need refresh page
  } catch (e) {
    res.sendStatus(500);
  }
});

router.post("/", async (req, res) => {
  let postInfo = req.body;

  if (!postInfo) {
    res.status(400).json({
      error: "You must provide data to create a post",
    });
    return;
  }

  if (!postInfo.userId) {
    res.status(400).json({
      error: "You must provide a userId",
    });
    return;
  }

  if (!postInfo.userName) {
    res.status(400).json({
      error: "You must provide a userId",
    });
    return;
  }

  if (!postInfo.title) {
    res.status(400).json({ error: "You must provide a title" });
    return;
  }

  if (!postInfo.postContent) {
    res.status(400).json({
      error: "You must provide content for the post",
    });
    return;
  }

  if (!postInfo.tags) {
    res.status(400).json({
      error: "You must provide a list of tags",
    });
    return;
  }

  try {
    const newPost = await postData.createPost(
      xss(postInfo.userId),
      xss(postInfo.userName),
      xss(postInfo.title),
      xss(postInfo.postContent),
      postInfo.tags
    );
    res.json(newPost);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.get("/userposts/:id", async (req, res) => {
  const id = xss(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid userId" });
    return;
  }
  try {
    let postList = await postData.getPostsByUser(id);
    res.json(postList);
  } catch (e) {
    res.status(404).json({ error: "Post not found" });
  }
});

router.get("/:id", async (req, res) => {
  const id = xss(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid postId" });
    return;
  }
  try {
    let post = await postData.getPostById(id);
    res.json(post);
  } catch (e) {
    res.status(404).json({ error: "Post not found" });
  }
});

// router.put("/:id", async (req, res) => {
//   let postInfo = req.body;

//   if (!postInfo) {
//     res.status(400).json({
//       error: "You must provide data to create a post",
//     });
//     return;
//   }

//   if (!postInfo.userId) {
//     res.status(400).json({
//       error: "You must provide a userId",
//     });
//     return;
//   }

//   if (!postInfo.title) {
//     res.status(400).json({ error: "You must provide a title" });
//     return;
//   }

//   if (!postInfo.postContent) {
//     res.status(400).json({
//       error: "You must provide content for the post",
//     });
//     return;
//   }

//   if (!postInfo.tags) {
//     res.status(400).json({
//       error: "You must provide a list of tags",
//     });
//     return;
//   }

//   const inputData = {
//     userId: xss(postInfo.userId),
//     userName: xss(postInfo.userName),
//     title: xss(postInfo.title),
//     postContent: xss(postInfo.postContent),
//     tags: xss(postInfo.tags),
//   };

//   try {
//     const updatedpost = await postData.updatePost(req.params.id, inputData);
//     res.json(updatedpost);
//   } catch (e) {
//     res.sendStatus(500);
//   }
// });

router.patch("/:id", async (req, res) => {
  const id = xss(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid postId" });
    return;
  }
  const requestBody = req.body;
  let updatedObject = {};
  try {
    const oldPost = await postData.getPostById(req.params.id);
    if (requestBody.title && requestBody.title !== oldPost.title)
      updatedObject.title = xss(requestBody.title);
    if (
      requestBody.postContent &&
      requestBody.postContent !== oldPost.postContent
    )
      updatedObject.postContent = xss(requestBody.postContent);
    if (requestBody.tags && requestBody.tags !== oldPost.tags)
      updatedObject.tags = xss(requestBody.tags);
    if (
      requestBody.postContent &&
      requestBody.postContent !== oldPost.postContent
    )
      updatedObject.postContent = xss(requestBody.postContent);
    if (requestBody.rating && requestBody.rating !== oldPost.rating)
      updatedObject.rating = xss(requestBody.rating);
    if (
      typeof requestBody.resolvedStatus === "boolean" &&
      requestBody.resolvedStatus !== oldPost.resolvedStatus
    )
      updatedObject.resolvedStatus = requestBody.resolvedStatus;
  } catch (e) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  if (Object.keys(updatedObject).length !== 0) {
    try {
      const updatedPost = await postData.updatePost(id, updatedObject);
      res.json(updatedPost);
    } catch (e) {
      res.status(500).json({ error: e });
    }
  } else {
    res.status(400).json({
      error:
        "No fields have been changed from their inital values, so no update has occurred",
    });
  }
});

router.delete("/:id", async (req, res) => {
  const id = xss(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid postId" });
    return;
  }
  try {
    await postData.getPostById(id);
  } catch (e) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  try {
    let deleted = await postData.deletePost(id);
    res.json(deleted);
  } catch (e) {
    res.sendStatus(500);
  }
});

module.exports = router;
