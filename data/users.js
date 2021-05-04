const mongoCollections = require("../config/mongoCollections");
const usersCollection = mongoCollections.users;
let { ObjectId } = require("mongodb");

async function getAllUsers() {
  const users = await usersCollection();
  const allUserData = await users.find({}).toArray();

  if (allUserData === null) {
    throw new Error("No users found in database");
  }
  return allUserData;
}

async function getAllUserIds() {
  const users = await usersCollection();
  const allUserIds = await users
    .find({}, { _id: 1 })
    .map(function (item) {
      return item._id;
    })
    .toArray();
  if (allUserIds === null) {
    throw new Error("No users found in database");
  }
  return allUserIds;
}

async function getUserById(userID) {
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

  return userData;
}

async function getUserbyEmail(email) {
  const users = await usersCollection();
  let userData = await users.findOne({ email: email });
  if (!userData) {
    throw new Error(
      `Cannot find user with given emai : ${email} into database`
    );
  }

  return userData;
}

// The authUserData will come from firebase auth, but we can just seed users for now until that is set up
async function createUser(authUserData) {
  // auth user data only consists user id, userName, email
  // id should be coming from auth, i think

  if (!authUserData.username) throw new Error("User userName is empty");
  if (!authUserData.email) throw new Error("User email is not valid");

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
    userName: authUserData.username,
    email: authUserData.email,
    password: authUserData.password,
    major: authUserData.major,
    gradYear: authUserData.year,
    courses: [],
    postId: [],
    commentId: [],
  };

  let newUser = await users.insertOne(userData);

  if (newUser.insertedCount === 0) {
    throw new Error(`Unable to add user into database`);
  }

  return await this.getUserById(newUser._id);
}
//-----------------------------------------------------

async function updateUser(userId, updatedUserData) {
  if (!ObjectId(userId)) {
    throw new Error("User id is not valid");
  }
  if (updatedUserData.userName && !updatedUserData.userName) {
    throw new Error("Updated user name is not valid");
  }

  let users = await usersCollection();

  // Check to see if the username is taken
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

  let updatedUser = await users.updateOne(
    { _id: userId },
    { $set: updatedUserData }
  );
  if (!updatedUser.modifiedCount && !updatedUser.matchedCount) {
    throw new Error(`Unable to update user with id : ${id} into database`);
  }

  return await this.getUserById(userId);
}

async function deleteUser(id) {
  if (!id) throw new Error("User id is not valid");

  const users = await usersCollection();

  let removedUser = await users.removeOne({ _id: id });

  if (removedUser.deletedCount === 0) {
    throw new Error(`Unable to delete user with id : ${id} from database`);
  }

  return true;
}

module.exports = {
  getAllUsers,
  getAllUserIds,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserbyEmail,
};
