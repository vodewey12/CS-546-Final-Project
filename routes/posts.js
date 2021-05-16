const express = require('express');
const router = express.Router();
const data = require('../data');
const xss = require('xss');
const { Router } = require('express');
const postData = data.posts;
const commentData = data.comments;
const userData = data.users;

function stringCheck(string) {
    return typeof string === 'string' && string.trim().length !== 0;
}

router.get('/', async (req, res) => {
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
            let numLikes = post.usersLiked.length;
            if (numLikes > 1) {
                post.likeCount = `${numLikes} Likes`;
            } else {
                post.likeCount = `${numLikes} Like`;
            }
            post.isLiked = likedPosts.includes(post._id);
        }

        res.render('dashboard/dashboard', {
            title: 'Dashboard',
            partial: 'dashboard_js_script',
            postItems: postList,
            sessionUserId: req.session.user.userId
        }); //(lecture_11 code index.js) partial at here only for passing in client side Javascript of /public/js/dashboard.js
        // res.render("dashboard/dashboard", { results: postList });  // if use { results: postList } pass 'results' in postCards.handlebars, we should put postCards.handlebars entirely into /views/dashboard/dashboard.handlebars, instead of putting it into partials. In this way, we maybe need refresh page
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

router.post('/', async (req, res) => {
    // create post function in dashboard
    try {
        await userData.getUserById(req.session.user.userId);
        let postInfo = req.body;
        if (
            !postInfo ||
            !stringCheck(postInfo.title) ||
            !stringCheck(postInfo.postContent) ||
            !stringCheck(postInfo.tags)
        ) {
            res.status(400).render('dashboard/dashboard', {
                title: 'dashboard',
                partial: 'dashboard_js_script',
                hasErrors: true,
                error: 'Must supply all fields. Please return back to dashboard through naviagation bar',
                userId: req.session.user.userId
            });
            //res.status(404).json({ error: 'Must supply all fields.' });
            //return;
        } else {
            let tags = postInfo.tags.split(',');
            for (let tag of tags) {
                tag = xss(tag);
            }

            await postData.createPost(
                req.session.user.userId,
                req.session.user.userName,
                xss(postInfo.title),
                xss(postInfo.postContent),
                tags
            );
            res.redirect('/posts/');
        }
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

router.get('/userposts/:id', async (req, res) => {
    try {
        await userData.getUserById(req.session.user.userId);
        const id = xss(req.params.id);
        if (!id) {
            res.status(400).json({ error: 'Invalid userId' });
            return;
        }
        try {
            let postList = await postData.getPostsByUser(id);
            res.json(postList);
        } catch (e) {
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

router.get('/:id', async (req, res) => {
    try {
        await userData.getUserById(req.session.user.userId);
        // ❤ render comments that belong to corresponding post
        const id = xss(req.params.id);
        if (!id) {
            res.status(400).json({ error: 'Invalid postId' });
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
            res.render('partials/comments', {
                title: 'Comments',
                partial: 'comments_js_script',
                postItems: post,
                comments: comments,
                sessionUserId: req.session.user.userId,
                userName: req.session.user.userName
            });
        } catch (e) {
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

router.put('/:id', async (req, res) => {
    try {
        await userData.getUserById(req.session.user.userId);
        let postInfo = req.body;

        if (!postInfo) {
            res.status(400).json({
                error: 'You must provide data to create a post'
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
                error: 'You must provide content for the post'
            });
            return;
        }

        if (!postInfo.tags) {
            res.status(400).json({
                error: 'You must provide a list of tags'
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
            tags: postInfo.tags
        };

        const updatedpost = await postData.updatePost(req.params.id, inputData);
        res.json(updatedpost);
    } catch (e) {
        res.sendStatus(500);
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        await userData.getUserById(req.session.user.userId);
        // ❤ render comments that belong to corresponding post
        const id = xss(req.params.id);
        if (!id) {
            res.status(400).json({ error: 'Invalid postId' });
            return;
        }
        try {
            const post = await postData.getPostByPostId(id);
            res.render('partials/edit', {
                title: 'Edit',
                partial: 'edit_js_script',
                postItems: post,
                sessionUserId: req.session.user.userId,
                userName: req.session.user.userName
            });
        } catch (e) {
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (e) {
        res.sendStatus(500);
    }
});

router.post('/edit/:id', async (req, res) => {
    try {
        await userData.getUserById(req.session.user.userId);
        // edit button function
        const id = xss(req.params.id);
        if (!id) {
            res.status(400).json({ error: 'Invalid postId' });
            return;
        }
        try {
            const oldPost = await postData.getPostByPostId(req.params.id);
            if (!req.params || !id) {
                throw 'Post ID not provided for edit!';
            }
            if (!req.body) {
                throw 'No request body provided!';
            }
            if (req.body.title && typeof req.body.title != 'string') {
                return res.status(400).json({
                    error: 'Invalid post title, cannot be empty, type should be string.'
                });
            }
            if (
                req.body.postContent &&
                typeof req.body.postContent != 'string'
            ) {
                return res.status(400).json({
                    error: 'Invalid post body, cannot be empty, type should be string.'
                });
            }
            if (req.body.tags && typeof req.body.tags != 'string') {
                return res.status(400).json({
                    error: 'Invalid tags, cannot be empty, type should be string.'
                });
            }
            let updatedObject = {};
            updatedObject.title = xss(req.body.title);
            updatedObject.postContent = xss(req.body.postContent);
            let tags = req.body.tags.split(',');
            for (let tag of tags) {
                tag = xss(tag);
            }
            updatedObject.tags = tags;
            const editedPost = await postData.updatePost(id, updatedObject);
            res.redirect('/posts/' + id);
        } catch (error) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
    } catch (e) {
        res.sendStatus(500);
    }
});

router.patch('/:id', async (req, res) => {
    try {
        await userData.getUserById(req.session.user.userId);
        const id = xss(req.params.id);
        if (!id) {
            res.status(400).json({ error: 'Invalid postId' });
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
                typeof requestBody.resolvedStatus === 'boolean' &&
                requestBody.resolvedStatus !== oldPost.resolvedStatus
            )
                updatedObject.resolvedStatus = requestBody.resolvedStatus;
        } catch (e) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        if (Object.keys(updatedObject).length !== 0) {
            try {
                const updatedPost = await postData.updatePost(
                    id,
                    updatedObject
                );
                res.json(updatedPost);
            } catch (e) {
                res.status(500).json({ error: e });
            }
        } else {
            res.status(400).json({
                error: 'No fields have been changed from their inital values, so no update has occurred'
            });
        }
    } catch (e) {
        res.sendStatus(500);
    }
});

router.get('/search/:searchterm', async (req, res) => {
    try {
        await userData.getUserById(req.session.user.userId);
        const searchTerm = xss(req.params.searchterm);
        if (!searchTerm) {
            res.status(400).json({ error: 'Invalid Search Term' });
        }

        const searchedPosts = await postData.searchPosts(searchTerm);
        res.json(searchedPosts);
    } catch (e) {
        res.sendStatus(500);
    }
});

router.post('/resolve', async (req, res) => {
    try {
        await userData.getUserById(req.session.user.userId);
        const postId = xss(req.body.postId);
        const commentId = xss(req.body.commentId);
        if (!postId) {
            res.status(400).json({ error: 'Invalid postId' });
            return;
        }
        if (!commentId) {
            res.status(400).json({ error: 'Invalid commentId' });
            return;
        }
        const requestBody = req.body;
        try {
            await postData.resolvePosts(postId);
            await commentData.markCommentSol(commentId);
            res.redirect('/posts');
        } catch (e) {
            res.status(404).json({ error: e });
        }
    } catch (e) {
        res.sendStatus(500);
    }
});

// router.delete("/:id", async (req, res) => {
//   const id = xss(req.params.id);
//   if (!id) {
//     res.status(400).json({ error: "Invalid postId" });
//     return;
//   }
//   try {
//     await postData.getPostById(id);
//   } catch (e) {
//     res.status(404).json({ error: "Post not found" });
//     return;
//   }

//   try {
//     let deleted = await postData.deletePost(id);
//     res.status(200).json(deleted);
//   } catch (e) {
//     res.sendStatus(500);
//   }
// });

router.post('/delete/:id', async (req, res) => {
    try {
        await userData.getUserById(req.session.user.userId);
        // delete button function
        const id = xss(req.params.id);
        if (!id) {
            res.status(400).json({ error: 'Invalid postId' });
            return;
        }

        await postData.getPostByPostId(id);
        let deleted = await postData.deletePost(id);
        res.redirect('/posts');
    } catch (e) {
        res.sendStatus(500);
    }
});

router.post('/like', async (req, res) => {
    try {
        await userData.getUserById(req.session.user.userId);
        if (!req.session.isLogIn) {
            res.status(401);
            res.redirect('/auth');
            return;
        }

        if (!req.body.userId || !req.body.postId) {
            res.status(404).json({ error: 'Must supply all fields.' });
            return;
        }

        let userId = xss(req.body.userId);
        let postId = xss(req.body.postId);

        try {
            let updatedPost = await postData.updateUsersLiked(postId, userId);
            res.status(200).json(updatedPost);
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: e.message });
        }
    } catch (e) {
        res.sendStatus(500);
    }
});

module.exports = router;
