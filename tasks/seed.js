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
    await db.dropDatabase();

    console.log('Done seeding database');

    await db.serverConfig.close();
}

main();