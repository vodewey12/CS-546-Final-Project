const MongoClient = require("mongodb").MongoClient;
const settings = {
  mongoConfig: {
    serverUrl: "mongodb://localhost:27017/",
    database: "Group34_Academic_Collaboration_Platform", //database name
  },
};
const mongoConfig = settings.mongoConfig;

let _connection = undefined;
let _db = undefined;

module.exports = async () => {
  if (!_connection) {
    _connection = await MongoClient.connect(mongoConfig.serverUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const postCollection = _connection
      .db(mongoConfig.database)
      .collection("posts");
    postCollection.createIndex({ title: "text" });
    const indexes = await postCollection.indexes();
    _db = await _connection.db(mongoConfig.database);
  }
  return _db;
};
