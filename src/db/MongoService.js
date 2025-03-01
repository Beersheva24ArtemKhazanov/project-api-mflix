import { MongoClient } from "mongodb";

export default class MongoService {
    #client;
    #db;
    constructor(connectionStr, dbName) {
        this.#client = new MongoClient(connectionStr);
        this.#db = this.#client.db(dbName);
    }

    getCollection(collectionName) {
        return this.#db.collection(collectionName);
    }

    async close() {
        await this.#client.close();
    }
}