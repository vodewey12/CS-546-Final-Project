const dbConnection = require('../config/mongoConnection');
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
    await db.dropDatabase();  //Removes the current database, deleting the associated data files.
    
    //test case for users collection
    //user:
    authUser1 = {
        username: "userName1",
        email: "user1@stevens.edu",
        password: "password",
        major: "Computer Science",
        year: 2023,
        courses: ['cs546', 'cs520', 'cs555']
    };
    const user1 = await users.createUser(authUser1);

    authUser2 = {
        userName: "user2",
        email: "user2@stevens.edu",
        passWord: "123",
        major: "Computer Engineering",
        gradYear: 2022,
        courses: ['cs546', 'cs555']
    };
    const user2 = await users.createUser(authUser2);

    authUser3 = {
        userName: "userName",
        email: "user3@stevens.edu",
        passWord: "456",
        major: "Soft Engineering",
        gradYear: 2021,
        courses: ['cs546', 'cs554']
    };
    const user3 = await users.createUser(authUser3);

    authUser4 = {
        userName: "userName",
        email: "group34@stevens.edu",
        passWord: "789",
        major: "Electrical Engineering",
        gradYear: 2021,
        courses: ['cs546', 'cs545']
    }
    const user4 = await users.createUser(authUser4);

    //test case for posts collection
    //post:
    const post1 = await posts.createPost(
        "111111b74218c3426861590e",
        "user1's userName",
        "Thie is 1st postTitle",
        "This is postContent",
        ["cs546", "cs545"]
    );

    const post2 = await posts.createPost(
        "222222b74218c3426861590e",
        "user2's userName",
        "Thie is 2nd postTitle",
        "This is postContent",
        ["cs546", "cs555"]
    );

    const post3 = await posts.createPost(
        "333333b74218c3426861590e",
        "user3's userName",
        "Thie is 3rd postTitle",
        "This is postContent",
        ["cs546", "cs520"]
    );
    
    const post4 = await posts.createPost(
        "333333b74218c3426861590e",
        "Eren Yaeger",
        "Thie is 4rd postTitle",
        "This is postContent",
        ["cs546", "cs555"]
    );

    //test case for comments collection
    //comment1:
    const comment1 = await comments.createComments(
        "I learn a lot in CS546.",  //comContent
        "Songhan Yu",  //userName
    );

    //comment2:
    const comment2 = await comments.createComments(
        "Lab assignment will due in next week.",  //comContent
        "Tom Cruise",  //userName
    );

    //comment3:
    const comment3 = await comments.createComments(
        "I will make my website as ugly as possible.",  //comContent
        "Scarlett Johansson",  //userName
    );

    //comment4:
    const comment4 = await comments.createComments(
        "Go and see Sherlock.",  //comContent
        "Benedict Cumberbatch",  //userName
    );

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

    const allUsers = await users.getAllUsers();
    console.log(allUsers);


    await db.serverConfig.close();
    console.log('Done seeding database');
}

main().catch((error) => {
    console.log(error);
});