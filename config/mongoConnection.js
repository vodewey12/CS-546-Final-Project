const MongoClient = require('mongodb').MongoClient;
const settings = {
    mongoConfig: {
        serverUrl: 'mongodb://localhost:27017/',
        database: 'Group34_Stevens_Collaboration_Platform' //database name
    }
};
const mongoConfig = settings.mongoConfig;

let _connection = undefined;
let _db = undefined;

module.exports = async () => {
    if (!_connection) {
        _connection = await MongoClient.connect(mongoConfig.serverUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        try {
            const postCollection = _connection
                .db(mongoConfig.database)
                .collection('posts');
            await postCollection.createIndex({ title: 'text' });
            const indexes = await postCollection.indexes();
        } catch (e) {
            console.log(e);
        }
        _db = await _connection.db(mongoConfig.database);
    }
    return _db;
};
