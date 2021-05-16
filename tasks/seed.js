const dbConnection = require('../config/mongoConnection');
const bcrypt = require('bcryptjs');  // other version by using 'bcryptjs'
const saltRounds = 10;  //the higher number, the longer time wil be 
const data = require('../data/');
const users = data.users;
const posts = data.posts;
const comments = data.comments;

/*
// Use if you would like
async function tryCatch(callback) {
    try {
        const result = await callback;
        console.log(result);
    } catch (e) {
        console.log(e);
    }
}
*/

async function main() {
    const db = await dbConnection();

    try{
        await db.dropDatabase();  //Removes the current database, deleting the associated data files.
    } catch (e){
        console.log('no previous db instance found.');
    }
    

    // users collection
    const user1 = await users.createUser({
        userName : "Sherlock",
        email: "sholmes@email.com",
        password: "$2a$16$7JKSiEmoP3GNDSalogqgPu0sUbwder7CAN/5wnvCWe6xCKAKwlTD.", // hashed [refer raw pwd from lab10 description]
        nickName: "masterdetective123",
        major: "Psychology",
        gradYear: "2023"
    });

    const user2 = await users.createUser({
        userName : "Elizabeth",
        email: "elemon@email.com",
        password: "$2a$16$SsR2TGPD24nfBpyRlBzINeGU61AH0Yo/CbgfOlU1ajpjnPuiQaiDm", // hashed [refer raw pwd from lab10 description]
        nickName: "lemon",
        major: "English",
        gradYear: "2024"
    });


    let passwordUser3 = '123';
    const user3 = await users.createUser({
        userName : "Songhan",
        email: "sh@email.com",
        password: await bcrypt.hash(passwordUser3, saltRounds),
        nickName: "songhanyu",
        major: "Computer",
        gradYear: "2023"
    });

    // const allUsers = await users.getAllUsers();
    // console.log(allUsers);

    //test case for posts collection
    const post1 = await posts.createPost(
        user1._id,
        user1.userName,
        "1st postTitle",
        "1st postContent",
        ["cs546", "cs545"]
    );

    const post2 = await posts.createPost(
        user2._id,
        user2.userName,
        "2nd postTitle",
        "2nd postContent",
        ["cs546", "cs555"]
    );

    const post3 = await posts.createPost(
        user3._id,
        user3.userName,
        "3rd postTitle",
        "3rd postContent",
        ["cs546", "cs520"]
    );
    
    const post4 = await posts.createPost(
        user3._id,
        user3.userName,
        "4th postTitle",
        "4th postContent",
        ["cs546", "cs555"]
    );

    const post5 = await posts.createPost(
        user3._id,
        user3.userName,
        "5th postTitle",
        "5th postContent",
        ["cs546", "cs555"]
    );


    //test case for comments collection
    //comment1:
    const comment1 = await comments.createComments(
        "I learn a lot in CS546.",  //comContent
        user1._id,
        "Songhan Yu",  //userName
    );

    //comment2:
    const comment2 = await comments.createComments(
        "Lab assignment will due in next week.",  //comContent
        user2._id,
        "Tom Cruise",  //userName
    );

    //comment3:
    const comment3 = await comments.createComments(
        "I will make my website as ugly as possible.",  //comContent
        user3._id,
        "Scarlett Johansson",  //userName
    );

    //comment4:
    const comment4 = await comments.createComments(
        "Go and see Sherlock.",  //comContent
        user3._id,
        "Benedict Cumberbatch",  //userName
    );


    await db.serverConfig.close();
    console.log('Done seeding database');
}

main().catch((error) => {
    console.log(error);
});