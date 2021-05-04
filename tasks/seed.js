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


    await db.serverConfig.close();
    console.log('Done seeding database');
}

main().catch((error) => {
    console.log(error);
});