const express = require("express");
const router = express.Router();
const data = require("../data");
const xss = require("xss");
const userData = data.users; // ../data/users.js
const postData = data.posts; // ../data/posts.js
const commentData = data.comments; // ../data/comments.js

router.get("/", async (req, res) => {
  // return an array of all comments
  try {
    const commentOfPost = await commentData.getAllComments();
    res.status(200).json(commentOfPost);
  } catch (e) {
    res.status(404).json({ message: "getAllComments() fails" });
    return;
  }
});

router.get("/:id", async (req, res) => {
  // /:id is commentId
  try {
    const commentOfPost = await commentData.getCommentByCommentId(
      xss(req.params.id)
    ); // req.params.id is commentId
    res.status(200).json(commentOfPost);
  } catch (e) {
    res
      .status(404)
      .json({ message: "getCommentByCommentId(req.params.id) fails" });
    return;
  }
});

router.post("/", async (req, res) => {
  const aCommentData = req.body; // get data that need to be posted
  if (!aCommentData.postId || typeof aCommentData.postId != "string") {
    res.status(400).json({ error: "There is no post ID" });
    return;
  }
  if (!aCommentData.userName || typeof aCommentData.userName != "string") {
    res.status(400).json({ error: "There is no userName" });
    return;
  }
  if (!aCommentData.comContent || typeof aCommentData.comContent != "string") {
    res
      .status(400)
      .json({ error: "You must provide comment Content in string type" });
    return;
  }
  if (!aCommentData.userId || typeof aCommentData.userId != "string") {
    res.status(400).json({ error: "There is no userID" });
    return;
  }

  try {
    // Json is valid and comment can be created successful
    const { comContent, userId, userName } = aCommentData;
    const commentThatPost = await commentData.createComments(
      xss(comContent),
      xss(userId),
      xss(userName)
    ); // create a comment
    const addCommentToPost = await postData.addComment(
      commentThatPost._id,
      aCommentData.postId
    );

    // ❤ fix comments give you json error
    const post = await postData.getPostByPostId(aCommentData.postId);

    let comments = [];
    for (i in post.commentIds) {
      comments.push(
        await commentData.getCommentByCommentId(post.commentIds[i])
      );
    }
    res.render("partials/comments", {
      title: "comments",
      postItems: post,
      comments: comments,
      userId: req.session.user.userId,
      userName: req.session.user.userName,
    });
  } catch (e) {
    res.status(500).json({ error: "createComments() fails" });
  }
});

router.patch("/:id", async (req, res) => {
  const updatedComment = req.body;
  if (!updatedComment.comContent) {
    res
      .status(400)
      .json({ error: "You must comment content that you want to update" });
    return;
  }

  let updatedObject = {};
  try {
    const currentComment = await commentData.getCommentByCommentId(
      xss(req.params.id)
    );
    // compare patchComment with currentComment
    if (
      updatedComment.comContent &&
      updatedComment.comContent !== currentComment.comContent
    )
      updatedObject.comContent = xss(updatedComment.comContent);
  } catch (e) {
    res.status(404).json({ error: "Patch failed" });
    return;
  }

  if (Object.keys(updatedObject).length !== 0) {
    //there is updated info
    try {
      const editCom = await commentData.editComment(
        xss(req.params.id),
        updatedObject
      );
      res.status(200).json(editCom);
    } catch (e) {
      res.status(500).json({ error: "editComment() fails" });
    }
  } else {
    res.status(400).json({
      error: "No comment content have been changed, so no update has occurred",
    });
  }
});

router.delete("/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: "You must supply an commentId to delete" });
    return;
  }

  try {
    await commentData.getCommentByCommentId(xss(req.params.id));
  } catch (e) {
    res.status(404).json({ error: "Comment not found with this id" });
    return;
  }

  try {
    await commentData.deleteComment(xss(req.params.id));
    res.status(200).json({ commentId: req.params.id, deleted: true });
  } catch (e) {
    res.status(500).json({ error: "deleteComment() fails" });
  }
});

router.patch("/markSol", async (req, res) => {
  if (!req.params.id) {
    res
      .status(400)
      .json({ error: "You must supply an commentId to mark it as solution" });
    return;
  }

  try {
    await commentData.getCommentByCommentId(xss(req.params.id));
  } catch (e) {
    res.status(404).json({ error: "Comment not found with this id" });
    return;
  }

  try {
    await commentData.markCommentSol(xss(req.params.id));
    res.status(200).json({ commentId: req.params.id, markCommentAsSol: true });
  } catch (e) {
    res.status(500).json({ error: "markSol fails" });
  }
});

router.patch("/upvote", async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: "You must supply an commentId to upvote" });
    return;
  }

  try {
    await commentData.getCommentByCommentId(xss(req.params.id));
  } catch (e) {
    res.status(404).json({ error: "Comment not found with this id" });
    return;
  }

  try {
    await commentData.upvoteComment(xss(req.params.id));
    res.status(200).json({ commentId: req.params.id, upvoteComment: true });
  } catch (e) {
    res.status(500).json({ error: "upvote fails" });
  }
});

router.patch("/downvote", async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: "You must supply an commentId to downvote" });
    return;
  }

  try {
    await commentData.getCommentByCommentId(xss(req.params.id));
  } catch (e) {
    res.status(404).json({ error: "Comment not found with this id" });
    return;
  }

  try {
    await commentData.downvoteComment(xss(req.params.id));
    res.status(200).json({ commentId: req.params.id, downvoteComment: true });
  } catch (e) {
    res.status(500).json({ error: "downvote fails" });
  }
});

module.exports = router;
