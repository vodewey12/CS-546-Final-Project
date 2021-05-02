const mongoCollections = require('../config/mongoCollections');
const comments = mongoCollections.comments;
const users = mongoCollections.users;
let usersJS = require('./users');  // we need use async method of books

let ObjectID = require('mongodb').ObjectID;  // MongoDB Node check if objectid is valid. https://stackoverflow.com/questions/11985228/mongodb-node-check-if-objectid-is-valid
let { ObjectId } = require('mongodb');


module.exports = {

  getCommentByCommentId: async function(commentId) {
    if (!commentId) throw 'You must provide an commentId to get their comments.';
    if (!typeof commentId !== 'string' || commentId.length === 0) throw 'commentId must be string type and not an empty string';
    if (!ObjectID.isValid(commentId)) throw "commentId provided is not a valid ObjectId";
    let parsedCommentId = ObjectId(commentId);

    const commentsCollection = await comments();
    const comment = await commentsCollection.findOne({_commentId: parsedCommentId});
    if (comment === null) throw 'No comment with that commentId';

    comment._commentId = comment._commentId.toString();  //convert ObjectId to String
    return comment;
  },


  createComments: async function(comContent, userName) {  // userId is string
    if (comContent == " ")  throw "Comment content with empty spaces are NOT valid strings";
    if (!comContent || !userName) throw "userId, comContent and userName is needed"
    if (typeof comContent !== 'string' || typeof userName !== 'string') throw "userId, comContent and userName must be string"
    if (comContent.length === 0 || userName.length === 0) throw 'comContent, userName must be provide'

    const commentsCollection = await comments();  //get reference to comment collection
    
    const newComment = {
      _commentId: ObjectId(),   // ObjectId
      comContent: comContent,  // stirng
      userName: userName,      // string
      postTime: Date(),        // Date
      rating: 0,               // Number
      isSolution: false        // Boolean: default is false
    };

    const insertComment = await commentsCollection.insertOne(newComment);
    if (insertComment.insertedCount === 0) throw 'Could not add comment into database';

    //after successfully inserting movie, mongo will automatically generate an _id for comment, then we can get the commentId
    let commentId = insertComment.insertedId;  //commentId is ObjectId
    commenId = commentId.toString();

    const comment = await this.getCommentByCommentId(commenId);
    return comment;
  },


  getAllComments: async function() {
    const commentsCollection = await comments();  //get reference to comment collection
    const commentList = await commentsCollection.find({}).toArray();

    //convert ObjectId to String for every array element
    for (let c of commentList) {
      c._commentId = c._commentId.toString();
    }

    return commentList;  //an array of object
  },

  
  editComment: async function (commentId, editedComment) {
    if (!commentId) throw 'You must provide an commentId for removing';
    if (typeof commentId !== 'string' || commentId.length === 0) throw "the commentId must be string type and not an empty string";
    if (!ObjectID.isValid(commentId)) throw "the commentId provided is not a valid ObjectId";
    if (!editedComment) throw 'You must provide an editedComment';
    if (editedComment.constructor !== Object) throw "the editedComment must be an object";
    if (Object.entries(editedComment).length === 0 && editedComment.constructor === Object) throw "editedComment Object cannot be an empty object";

    const updatedComment = {};
    if (editedComment.comContent) {  // only update comment content
      updatedComment.comContent = editedComment.comContent;
    }
    
    let parsedCommentId = ObjectId(commentId);
    const commentsCollection = await comments();
    const currentComment = await commentsCollection.findOne({ _commentId: parsedCommentId})  //store original comment before updating

    updatedComment.userName = currentComment.userName;
    updatedComment.postTime = Date();  // update comment time
    updatedComment.rating = currentComment.rating;
    updatedComment.isSolution = currentComment.isSolution;  // if comment is solution, after editing, it still is solution

    return await commentsCollection.updateOne( { _commentId: parsedCommentId }, { $set: updatedComment })
      .then(function () {
        return module.exports.getCommentByCommentId(commentId);
      })
  },


  deleteComment: async function(commentId) {
    if (!commentId) throw 'You must provide an commentId for removing';
    if (typeof commentId !== 'string' || commentId.length === 0) throw "the commentId must be string type and not an empty string";
    if (!ObjectID.isValid(commentId)) throw "the commentId provided is not a valid ObjectId";
    let parsedCommentId = ObjectId(commentId);
    
    const commentsCollection = await comments();
    const comment = await this.getCommentByCommentId(parsedCommentId);

    const deletionInfo = await movieCollection.deleteOne({ _commentId: parsedCommentId });

    if (deletionInfo.deletedCount === 0) {
      throw `Could not delete comment with commentId of ${commentId}`;
    }

    return `${comment.comContent} has been successfully deleted`;
  },


  markCommentSol: async function(commentId) {  // mark this comment as solution
    if (!commentId) throw 'You must provide an commentId for removing';
    if (typeof commentId !== 'string' || commentId.length === 0) throw "the commentId must be string type and not an empty string";
    if (!ObjectID.isValid(commentId)) throw "the commentId provided is not a valid ObjectId";
    let parsedCommentId = ObjectId(commentId);

    const commentsCollection = await comments();
    const comment = await this.getCommentByCommentId(parsedCommentId);

    const solComment = {};
    
    let parsedCommentId = ObjectId(commentId);
    const commentsCollection = await comments();
    const currentComment = await commentsCollection.findOne({ _commentId: parsedCommentId})  //store original comment before updating

    solComment.comContent = currentComment.comContent;
    solComment.userName = currentComment.userName;
    solComment.postTime = Date();  // update comment time
    solComment.rating = currentComment.rating;
    solComment.isSolution = true;  // we regard the comment is solution, so mark it as 'true'

    return await commentsCollection.updateOne( { _commentId: parsedCommentId }, { $set: solComment })
      .then(function () {
        return module.exports.getCommentByCommentId(commentId);
      })
  },

  
  upvoteComment: async function(commentId) {
    if (!commentId) throw 'You must provide an commentId for removing';
    if (typeof commentId !== 'string' || commentId.length === 0) throw "the commentId must be string type and not an empty string";
    if (!ObjectID.isValid(commentId)) throw "the commentId provided is not a valid ObjectId";
    let parsedCommentId = ObjectId(commentId);

    const commentsCollection = await comments();
    const comment = await this.getCommentByCommentId(parsedCommentId);

    const upvoteComment = {};
    
    let parsedCommentId = ObjectId(commentId);
    const commentsCollection = await comments();
    const currentComment = await commentsCollection.findOne({ _commentId: parsedCommentId})  //store original comment before updating

    upvoteComment.comContent = currentComment.comContent;
    upvoteComment.userName = currentComment.userName;
    upvoteComment.postTime = Date();  // update comment time
    upvoteComment.rating = currentComment.rating + 1;
    upvoteComment.isSolution = currentComment.isSolution;

    return await commentsCollection.updateOne( { _commentId: parsedCommentId }, { $set: upvoteComment })
      .then(function () {
        return module.exports.getCommentByCommentId(commentId);
      })
  },


  downvoteComment: async function(commentId) {
    if (!commentId) throw 'You must provide an commentId for removing';
    if (typeof commentId !== 'string' || commentId.length === 0) throw "the commentId must be string type and not an empty string";
    if (!ObjectID.isValid(commentId)) throw "the commentId provided is not a valid ObjectId";
    let parsedCommentId = ObjectId(commentId);

    const commentsCollection = await comments();
    const comment = await this.getCommentByCommentId(parsedCommentId);

    const downvoteComment = {};
    
    let parsedCommentId = ObjectId(commentId);
    const commentsCollection = await comments();
    const currentComment = await commentsCollection.findOne({ _commentId: parsedCommentId})  //store original comment before updating

    downvoteComment.comContent = currentComment.comContent;
    downvoteComment.userName = currentComment.userName;
    downvoteComment.postTime = Date();  // update comment time
    downvoteComment.rating = currentComment.rating - 1;
    downvoteComment.isSolution = currentComment.isSolution;

    return await commentsCollection.updateOne( { _commentId: parsedCommentId }, { $set: downvoteComment })
      .then(function () {
        return module.exports.getCommentByCommentId(commentId);
      })
  }
};