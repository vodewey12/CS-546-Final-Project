const express = require('express');
const router = express.Router();
const data = require('../data');
const postData = data.posts;
const userData = data.users;

router.get('/', async (req, res) => {
    try {
        let postList = await postData.getAllPosts();
        res.json(postList);
    } catch (e) {
        res.sendStatus(500);
    }
});

router.post('/', async (req, res) => {
    let postInfo = req.body;

    if (!postInfo) {
        res.status(400).json({
            error: 'You must provide data to create a post'
        });
        return;
    }

    if (!postInfo.userId) {
        res.status(400).json({
            error: 'You must provide a userId'
        });
        return;
    }

    if (!postInfo.title) {
        res.status(400).json({ error: 'You must provide a title' });
        return;
    }

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

    try {
        const newPost = await postData.createPost(
            postInfo.userId,
            postInfo.title,
            postInfo.postContent,
            postInfo.tags
        );
        res.json(newPost);
    } catch (e) {
        res.sendStatus(500);
    }
});

router.get('/:id', async (req, res) => {
    try {
        let post = await postData.getPostById(req.params.id);
        res.json(post);
    } catch (e) {
        res.status(404).json({ error: 'Post not found' });
    }
});

router.put('/:id', async (req, res) => {
    let postInfo = req.body;

    if (!postInfo) {
        res.status(400).json({
            error: 'You must provide data to create a post'
        });
        return;
    }

    if (!postInfo.userId) {
        res.status(400).json({
            error: 'You must provide a userId'
        });
        return;
    }

    if (!postInfo.title) {
        res.status(400).json({ error: 'You must provide a title' });
        return;
    }

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

    try {
        const updatedpost = await postData.updatePost(req.params.id, postInfo);
        res.json(updatedpost);
    } catch (e) {
        res.sendStatus(500);
    }
});

router.patch('/:id', async (req, res) => {
    const requestBody = req.body;
    let updatedObject = {};
    try {
        const oldPost = await postData.getPostById(req.params.id);
        if (requestBody.title && requestBody.title !== oldPost.title)
            updatedObject.title = requestBody.title;
        if (
            requestBody.postContent &&
            requestBody.postContent !== oldPost.postContent
        )
            updatedObject.postContent = requestBody.postContent;
        if (requestBody.tags && requestBody.tags !== oldPost.tags)
            updatedObject.tags = requestBody.tags;
        if (
            requestBody.postContent &&
            requestBody.postContent !== oldPost.postContent
        )
            updatedObject.postContent = requestBody.postContent;
        if (requestBody.rating && requestBody.rating !== oldPost.rating)
            updatedObject.rating = requestBody.rating;
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
                req.params.id,
                updatedObject
            );
            res.json(updatedPost);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    } else {
        res.status(400).json({
            error:
                'No fields have been changed from their inital values, so no update has occurred'
        });
    }
});

router.delete('/:id', async (req, res) => {
    if (!req.params.id) throw 'You must specify an ID to delete';

    try {
        await postData.getPostById(req.params.id);
    } catch (e) {
        res.status(404).json({ error: 'Post not found' });
        return;
    }

    try {
        let deleted = await postData.deletePost(req.params.id);
        res.json(deleted);
    } catch (e) {
        res.sendStatus(500);
    }
});

module.exports = router;
