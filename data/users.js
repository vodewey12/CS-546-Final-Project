const mongoCollections = require("../config/mongoCollections");
const usersCollection = mongoCollections.users;
let { ObjectId } = require("mongodb");

async function getAllUsers() {
  const users = await usersCollection();
  const allUserData = await users.find({}).toArray();

  if (allUserData === null) {
    throw new Error("No users found in database");
  }

  allUserData.forEach((user) => {
    user._id = user._id.toString();
  });

  return allUserData;
}

async function getAllUserIds() {
  const users = await usersCollection();
  const allUserIds = await users
    .find({}, { _id: 1 })
    .map(function (item) {
      return item._id.toString();
    })
    .toArray();
  if (allUserIds === null) {
    throw new Error("No users found in database");
  }
  return allUserIds;
}

async function getUserById(userID) {
  if (!userID || typeof userID !== "string" || userID.trim().length === 0) {
    throw "userID must be a non-empty string";
  }

  if (!ObjectId.isValid(userID)) {
    throw new Error("Given user id is not valid");
  }
  const users = await usersCollection();
  let userData = await users.findOne({ _id: ObjectId(userID) });

  if (!userData) {
    throw new Error(
      `Cannot find user with given id : ${ObjectId(userID)} into database`
    );
  }

  userData._id = userData._id.toString();
  return userData;
}

async function getUserbyEmail(email) {
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    throw "email must be a non-empty string";
  }
  email = email.toLowerCase();

  const users = await usersCollection();
  let userData = await users.findOne({ email: email });
  if (!userData) {
    throw new Error(
      `Cannot find user with given emai : ${email} into database`
    );
  }

  userData._id = userData._id.toString();
  return userData;
}

// The authUserData will come from firebase auth, but we can just seed users for now until that is set up
async function createUser(authUserData) {
  // auth user data only consists user id, userName, email
  // id should be coming from auth, i think

  if (
    !authUserData ||
    typeof authUserData !== "object" ||
    Array.isArray(authUserData)
  ) {
    throw "authUserData is a required object parameter.";
  }

  if (
    !authUserData.userName ||
    typeof authUserData.userName !== "string" ||
    authUserData.userName.trim().length === 0
  ) {
    throw "username is a required non-empty string parameter.";
  }

  if (!authUserData.email) throw new Error("User email is not valid");

  let email = authUserData.email;
  let emailformat =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (typeof email !== "string" || !email.match(emailformat)) {
    throw "Invalid email";
  }

  if (
    !authUserData.password ||
    typeof authUserData.password !== "string" ||
    authUserData.password.trim().length === 0
  ) {
    throw "password is a required non-empty string parameter.";
  }

  if (
    !authUserData.nickName ||
    typeof authUserData.nickName !== "string" ||
    authUserData.nickName.trim().length === 0
  ) {
    throw "nickName is a required non-empty string parameter.";
  }

  if (
    !authUserData.major ||
    typeof authUserData.major !== "string" ||
    authUserData.major.trim().length === 0
  ) {
    throw "major is a required non-empty string parameter.";
  }

  let yearFormat = /20\d\d/gm;
  if (
    !authUserData.gradYear ||
    typeof authUserData.gradYear !== "string" ||
    authUserData.gradYear.trim().length === 0
  ) {
    throw "gradYear is a required string parameter"; // storing as strings since we won't do date calculations
  }
  let gradYear = authUserData.gradYear;
  if (!gradYear.match(yearFormat)) {
    throw "invalid gradYear";
  }

  const users = await usersCollection();

  // Check to see if the username is taken
  sameUserNames = await users
    .find({ userName: authUserData.userName })
    .toArray();
  sameUserNames.forEach((user) => {
    if (authUserData.userName.toLowerCase() === user.userName.toLowerCase()) {
      throw new Error("userName is already taken");
    }
  });

  // Check to see if the email is already used
  sameEmails = await users.find({ email: authUserData.email }).toArray();
  sameEmails.forEach((user) => {
    if (authUserData.email.toLowerCase() === user.email.toLowerCase()) {
      throw new Error("email is already taken");
    }
  });

  let userData = {
    userName: authUserData.userName,
    email: authUserData.email.toLowerCase(), // for case insensitive log in
    password: authUserData.password,
    nickName: authUserData.nickName,
    major: authUserData.major,
    gradYear: authUserData.gradYear,
    courses: [],
    postId: [],
    commentId: [],
    likedPosts: [], // ids of posts the user liked
  };

  let newUser = await users.insertOne(userData);

  if (newUser.insertedCount === 0) {
    throw new Error(`Unable to add user into database`);
  }
  return await this.getUserById(newUser.insertedId.toString());
}
//-----------------------------------------------------

async function updateUser(userId, updatedUserData) {
  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    throw "userId must be a non-empty string";
  }

  if (!ObjectId(userId)) {
    throw new Error("User id is not valid");
  }

  if (
    !updatedUserData ||
    typeof updatedUserData !== "object" ||
    Array.isArray(updatedUserData)
  ) {
    throw "updatedUserData is a required object parameter.";
  }

  if (
    updatedUserData.username &&
    (typeof updatedUserData.username !== "string" ||
      updatedUserData.username.trim().length === 0)
  ) {
    throw "username is a required non-empty string parameter.";
  }

  let email = updatedUserData.email;
  if (email) {
    let emailformat =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (typeof email !== "string" || !email.match(emailformat)) {
      throw "Invalid email";
    }
    updatedUserData.email = updatedUserData.email.toLowerCase();
  }

  if (
    updatedUserData.password &&
    (typeof updatedUserData.password !== "string" ||
      updatedUserData.password.trim().length === 0)
  ) {
    throw "password is a required non-empty string parameter.";
  }

  if (
    updatedUserData.nickName &&
    (typeof updatedUserData.nickName !== "string" ||
      updatedUserData.nickName.trim().length === 0)
  ) {
    throw "nickName is a required non-empty string parameter.";
  }

  if (
    updatedUserData.major &&
    (typeof updatedUserData.major !== "string" ||
      updatedUserData.major.trim().length === 0)
  ) {
    throw "major is a required non-empty string parameter.";
  }

  let yearFormat = /20\d\d/gm;
  if (
    updatedUserData.gradYear &&
    (typeof updatedUserData.gradYear !== "string" ||
      updatedUserData.gradYear.trim().length === 0)
  ) {
    throw "gradYear is a required string parameter"; // storing as strings since we won't do date calculations
  }
  if (updatedUserData.gradYear) {
    let gradYear = updatedUserData.gradYear;
    if (!gradYear.match(yearFormat)) {
      throw "invalid gradYear";
    }
  }

  if(updatedUserData.likedPosts && !Array.isArray(updatedUserData.likedPosts)){
    throw "likedPosts must be an array";
  }

  let users = await usersCollection();

  // Check to see if the username is taken
  if(updatedUserData.userName){ // optional item
    
    sameUserNames = await users
    .find({ userName: updatedUserData.userName })
    .toArray();
    
    sameUserNames.forEach((user) => {
      if (
        updatedUserData.userName.toLowerCase() === user.userName.toLowerCase()
      ) {
        throw new Error("userName is already taken");
      }
    });
  }
  

  let updatedUser = await users.updateOne(
    { _id: ObjectId(userId) },
    { $set: updatedUserData }
  );
  if (!updatedUser.modifiedCount && !updatedUser.matchedCount) {
    throw new Error(`Unable to update user with id : ${id} into database`);
  }

  return await this.getUserById(userId);
}

async function deleteUser(id) {
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    throw "userId must be a non-empty string";
  }

  if (!ObjectId(id)) {
    throw new Error("User id is not valid");
  }

  const users = await usersCollection();

  let removedUser = await users.removeOne({ _id: ObjectId(id) });

  if (removedUser.deletedCount === 0) {
    throw new Error(`Unable to delete user with id : ${id} from database`);
  }

  return true;
}

async function updateLikedPosts(userId , postId){

  if (
    !userId ||
    typeof userId !== "string" ||
    userId.trim().length === 0
  ) {
    throw "userId is a required non-empty string parameter.";
  }

  if (
    !postId ||
    typeof postId !== "string" ||
    postId.trim().length === 0
  ) {
    throw "postId is a required non-empty string parameter.";
  }

  const userInfo = await this.getUserById(userId);
  const updatedlikedPosts = userInfo.likedPosts;

  let found = false;
  let postIndex;
  let i = 0;
  for(let post of updatedlikedPosts){
    if(post === postId){
      found = true;
      postIndex = i;
      break;
    }
    i++;
  }

  if(found){ // delete
    updatedlikedPosts.splice(postIndex , 1);
  }else{ // insert
    updatedlikedPosts.push(postId);
  }

  return await this.updateUser(userId , {likedPosts : updatedlikedPosts});
}

module.exports = {
  getAllUsers,
  getAllUserIds,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserbyEmail,
  updateLikedPosts
};
