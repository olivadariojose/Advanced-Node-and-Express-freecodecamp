// connection.js
const { MongoClient, ServerApiVersion } = require('mongodb');
const URI = process.env.MONGO_URI;

let client;
module.exports = async function myDB(callback) {
  if (!URI) throw new Error('Missing MONGO_URI');
  if (!client) {
    client = new MongoClient(URI, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    });
    await client.connect();
    console.log('MongoDB connected');
  }
  return callback(client);
};
