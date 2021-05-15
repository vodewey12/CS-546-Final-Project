const express = require("express");
const router = express.Router();
const data = require("../data");
const xss = require("xss");
const { Router } = require("express");
const postData = data.posts;
const commentData = data.comments;
router.get("/", async (req, res) => {
  // ❤ dashboard
  try {
    const postList = await postData.getAllPosts();
    const userInfo = await userData.getUserById(req.session.user.userId);
    const likedPosts = userInfo.likedPosts;
    
    for (let post of postList) {
      if (post.userId == req.session.user.userId) {
        post.user = true;
        // console.log(post);
      }
      post.isLiked = likedPosts.includes(post._id);
    }

    res.render("dashboard/dashboard", {
      title: "dashboard",
      partial: "dashboard_js_script",
      postItems: postList,
      sessionUserId: req.session.user.userId,
      user: true,
    }); //(lecture_11 code index.js) partial at here only for passing in client side Javascript of /public/js/dashboard.js
    // res.render("dashboard/dashboard", { results: postList });  // if use { results: postList } pass 'results' in postCards.handlebars, we should put postCards.handlebars entirely into /views/dashboard/dashboard.handlebars, instead of putting it into partials. In this way, we maybe need refresh page
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.post("/", async (req, res) => {
  let postInfo = req.body;
  if (!postInfo || !postInfo.title || !postInfo.postContent || !postInfo.tags) {
    res.status(400).render("dashboard/dashboard", {
      title: "dashboard",
      partial: "dashboard_js_script",
      hasErrors: true,
      error: "Must supply all fields.",
      userId: req.session.user.userId,
    });
    //res.status(404).json({ error: 'Must supply all fields.' });
    //return;
  } else {
    let tags = postInfo.tags.split(", ");
    for (let tag of tags) {
      tag = xss(tag);
    }
    try {
      await postData.createPost(
        req.session.user.userId,
        req.session.user.userName,
        xss(postInfo.title),
        xss(postInfo.postContent),
        tags
      );
      res.redirect("/posts/");
    } catch (e) {
      res.sendStatus(500);
    }
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
  // ❤ render comments that belong to corresponding post
  const id = xss(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid postId" });
    return;
  }
  try {
    const post = await postData.getPostByPostId(id);

    let comments = [];
    for (i in post.commentIds) {
      comments.push(
        await commentData.getCommentByCommentId(post.commentIds[i])
      );
    }
    res.render("partials/comments", {
      title: "comments",
      partial: "comments_js_script",
      postItems: post,
      comments: comments,
      sessionUserId: req.session.user.userId,
      userName: req.session.user.userName,
    });
  } catch (e) {
    res.status(404).json({ error: "Post not found" });
  }
});

router.put("/:id", async (req, res) => {
  let postInfo = req.body;

  if (!postInfo) {
    res.status(400).json({
      error: "You must provide data to create a post",
    });
    return;
  }
  /*
  if (!postInfo.userId) {
    res.status(400).json({
      error: "You must provide a userId",
    });
    return;
  }

  if (!postInfo.title) {
    res.status(400).json({ error: "You must provide a title" });
    return;
  }
  */
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
  for (let tag of postInfo.tags) {
    tag = xss(tag);
  }

  const inputData = {
    userId: req.session.user.userId,
    userName: req.session.user.userName,
    title: xss(postInfo.title),
    postContent: xss(postInfo.postContent),
    tags: postInfo.tags,
  };

  try {
    const updatedpost = await postData.updatePost(req.params.id, inputData);
    res.json(updatedpost);
  } catch (e) {
    res.sendStatus(500);
  }
});

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
    if (requestBody.tags && requestBody.tags !== oldPost.tags) {
      for (let tag of requestBody.tags) {
        tag = xss(tag);
      }
      updatedObject.tags = requestBody.tags;
    }
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

router.get("/search/:searchterm", async (req, res) => {
  const searchTerm = xss(req.params.searchterm);
  if (!searchTerm) {
    res.status(400).json({ error: "Invalid Search Term" });
  }
  try {
    const searchedPosts = await postData.searchPosts(searchTerm);
    res.json(searchedPosts);
  } catch (e) {
    res.status(500).json({ error: "Can't Find Any Posts" });
  }
});

router.post("/resolve", async (req, res) => {
  const postId = xss(req.body.postId);
  const commentId = xss(req.body.commentId);
  if (!postId) {
    res.status(400).json({ error: "Invalid postId" });
    return;
  }
  if (!commentId) {
    res.status(400).json({ error: "Invalid commentId" });
    return;
  }
  const requestBody = req.body;
  try {
    await postData.resolvePosts(postId);
    await commentData.markCommentSol(commentId);
    res.redirect("/" + postId);
  } catch (e) {
    res.status(404).json({ error: e });
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
    res.status(200).json(deleted);
  } catch (e) {
    res.sendStatus(500);
  }
});

// router.get("/tags", async (req, res) => {  //search bar for tag to hit this router and pass in tag
//   const tagInfo = req.body;

//   if (!tagInfo || !tagInfo.tags) {
//     res.status(400).json({
//       error: "You must provide tags in search bar to search",
//     });
//     return;
//   }

//   const postListByTags = await postData.getPostsByTag(tagInfo.tags);

//   for (let post of postListByTags) {
//     if (post.userId == req.session.user.userId) {
//       post.user = true;
//       // console.log(post);
//     }
//   }
//   res.render("dashboard/dashboard", {
//     title: "dashboard",
//     partial: "dashboard_js_script",
//     postItems:  postListByTags,
//     userId: req.session.user.userId,
//     user: true,
//   });
// });

module.exports = router;
