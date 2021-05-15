const mongoCollections = require("../config/mongoCollections");
const posts = mongoCollections.posts;
const users = require("./users");
const { ObjectId } = require("mongodb");
let ObjectID = require("mongodb").ObjectID;

function stringCheck(string) {
  return typeof string === "string" && string.trim().length !== 0;
}

function idCheck(id) {
  if (!stringCheck(id)) throw "id parameter must be a nonempty string";
  if (!ObjectID.isValid(id)) throw "id parameter must be a valid ObjectID";
  return ObjectId(id);
}

const exportedMethods = {
  async getAllPosts() {
    const postCollection = await posts();
    const postList = await postCollection
      .find({})
      .sort({ postTime: -1 })
      .toArray();
    if (!postList) throw "No posts in system!";
    postList.forEach((post) => {
      post._id = post._id.toString();
    });
    return postList;
  },

  async getPostsByTag(tag) {
    // for filtering post by tags
    if (!tag) throw "No tag provided";

    const postCollection = await posts();
    return await postCollection.find({ tags: tag }).toArray();
  },

  async getPostsByUserId(id) {
    let userId = idCheck(id);
    const postCollection = await posts();
    const postList = await postCollection.find({ userId: userId }).toArray(); // userId in post collection is Sting
    if (!postList) throw "no posts by given user found";
    return postList;
  },

  async getPostByPostId(id) {
    let postId = idCheck(id);
    const postCollection = await posts();
    const post = await postCollection.findOne({ _id: postId });
    if (!post) throw "post not found";
    return post;
  },

  async createPost(userId, userName, title, postContent, tags) {
    // postId, postTime, rating, resolvedStatus, commentIds will be generated
    // other parameters are received from routes
    if (arguments.length < 5) throw "not enough arguments provided";
    if (
      !(
        stringCheck(userName) &&
        stringCheck(userId) &&
        stringCheck(title) &&
        stringCheck(postContent)
      )
    )
      throw "userName, userId, title, and postContent parameters must be strings";

    const postCollection = await posts();
    let newPost = {
      userId: ObjectId(userId),
      userName: userName,
      title: title,
      postContent: postContent,
      tags: tags, // [“CS546”, "CS554"]
      postTime: new Date(),
      rating: 0,
      resolvedStatus: false,
      commentIds: [], // [“6055a6784765c78268613749”, … ]
      usersLiked: [], // array of user ids that liked this post
    };
    const newInsertInformation = await postCollection.insertOne(newPost);
    if (newInsertInformation.insertedCount === 0) throw "Insert failed!";
    const newID = newInsertInformation.insertedId.toString();
    return await this.getPostByPostId(newID);
  },
  async searchPosts(searchTerm) {
    if (!searchTerm) throw "No search term provided";
    const postCollection = await posts();
    var phrase = '"' + searchTerm + '"';
    const searchedPosts = await postCollection
      .aggregate([{ $match: { $text: { $search: phrase } } }])
      .toArray();
    return searchedPosts;
  },

  async updatePost(id, updatedPost) {
    // user edits a post
    // title, postContent, tags, rating, resolvedStatus can be updated
    // postTime will be updated as well
    let postId = idCheck(id);
    let postUpdateInfo = {};
    if (updatedPost.title) {
      if (!stringCheck(updatedPost.title))
        throw "title attribute must be a nonempty string";
    }
    if (updatedPost.postContent) {
      if (!stringCheck(updatedPost.postContent))
        throw "postContent attribute must be a nonempty string";
    }
    if (updatedPost.tags) {
      if (
        !(
          Array.isArray(updatedPost.tags) && updatedPost.tags.every(stringCheck)
        )
      )
        throw "tags attribute must be an array of strings";
    }

    if (updatedPost.usersLiked && !Array.isArray(updatedPost.usersLiked)){
      throw 'usersLiked must be an array.';
    }

    if(updatedPost.usersLiked){
      postUpdateInfo.usersLiked = updatedPost.usersLiked;
    }

    const postCollection = await posts();
    const previousInfo = await postCollection.findOne({ _id: postId });
    const updateInfo = await postCollection.updateOne(
      { _id: postId },
      {
        $set: {
          postTime: new Date(),
          title: updatedPost.title,
          postContent: updatedPost.postContent,
          tags: updatedPost.tags,
        },
      }
    );
    console.log('should be updated');
    if (!updateInfo && !updateInfo.modifiedCount){
      throw "Update failed";
    }
    let res = await this.getPostByPostId(postId.toString());
    console.log(res);
    return res;
  },

  async deletePost(id) {
    let postId = idCheck(id);
    const postCollection = await posts();
    const deletionInfo = await postCollection.deleteOne({ _id: postId }); //https://stackoverflow.com/questions/42715591/mongodb-difference-remove-vs-findoneanddelete-vs-deleteone/42715715
    if (deletionInfo.deletedCount === 0) {
      throw `Could not delete post with id of ${id}`;
    }
    return { postId: postId.toString(), deleted: true };
  },

  async addComment(commentId, postId) {
    if (!postId || !ObjectID.isValid(postId)) {
      throw new Error("Post ID is invalid.");
    }

    if (!commentId || !ObjectID.isValid(commentId)) {
      throw new Error("Post ID is invalid.");
    }
    try {
      const postCollection = await posts();
      const post = await postCollection.updateOne(
        { _id: ObjectId(postId) },
        {
          $push: {
            commentIds: commentId,
          },
        }
      );
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async resolvePosts(id) {
    let postId = idCheck(id);
    try {
      const postCollection = await posts();
      const updateInfo = await postCollection.updateOne(
        { _id: postId },
        {
          $set: {
            resolvedStatus: true,
          },
        }
      );
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async updateUsersLiked(post_id , user_id){

    console.log('db hit');
    if (
      !user_id ||
      typeof user_id !== "string" ||
      user_id.trim().length === 0
    ) {
      throw "userId is a required non-empty string parameter.";
    }
  
    if (
      !post_id ||
      typeof post_id !== "string" ||
      post_id.trim().length === 0
    ) {
      throw "postId is a required non-empty string parameter.";
    }
  
    const postInfo = await this.getPostByPostId(post_id);
    const updatedUsersLiked = postInfo.usersLiked;
  
    let found = false;
    let userIndex;
    let i = 0;
    for(let user of updatedUsersLiked){
      if(user === user_id){
        found = true;
        userIndex = i;
        break;
      }
      i++;
    }
  
    if(found){ // delete
      updatedUsersLiked.splice(userIndex , 1);
    }else{ // insert
      updatedUsersLiked.push(user_id);
    }
    console.log(updatedUsersLiked);
    return await this.updatePost(post_id , {usersLiked : updatedUsersLiked});
    
    
  }
};

module.exports = exportedMethods;
