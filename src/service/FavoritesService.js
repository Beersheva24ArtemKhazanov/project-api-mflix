import { ObjectId } from "mongodb";
import MongoService from "../db/MongoService.js";
import { createError } from "../errors/errors.js";


const {
    MONGO_CONNECTION,
    MONGO_PASSWORD,
    MONGO_CLUSTER,
    DB_NAME,
    FAVORITES_COLLECTION,
} = process.env;

class FavoritesService {
    #mongoConnection;
    #favorites
    constructor() {
        this.#mongoConnection = new MongoService(`${MONGO_CONNECTION}:${MONGO_PASSWORD}@${MONGO_CLUSTER}`, DB_NAME);
        this.#favorites = this.#mongoConnection.getCollection(FAVORITES_COLLECTION);
    }

    async addFavorite (favorite) {
        const fav = await this.#favorites.findOne({'email':favorite.email, 'movie_id': favorite.movie_id});
        if(fav) {
            throw createError(409, `the favorite object with email ${favorite.email} and movie_id ${favorite.movie_id} already exists`);
        }
        const addedFavorite = this.#toDbFavorite(favorite);
        const obj = await this.#favorites.insertOne(addedFavorite);
        addedFavorite._id = obj.insertedId;
        return addedFavorite;
    }

    #toDbFavorite(favorite) {
        const {email, movie_id, viewed, feed_back } = favorite;
        const actualViewed = !viewed ? false : viewed;
        return { email, movie_id, viewed: actualViewed, feed_back};

    }

    async getFavorite(favoriteId) {
        const favorite  = await this.#favorites.findOne({_id: new ObjectId(favoriteId + '')});
        return favorite;
    }

    async getUserFavorites(email) {
        const favorites = await this.#favorites.find({'email': email}).toArray();
        return favorites;
    }

    async updateFavorite(favorite) {
        const updObj = {}
        if (favorite.viewed) {
            updObj.viewed = favorite.viewed;
        }
        if (favorite.feedBack) {
            updObj.feed_back = favorite.feedBack;
        }
        const updatedFavorite = await this.#favorites.findOneAndUpdate({_id: new ObjectId(favorite.favoriteId + '')},{$set:updObj}, { returnDocument: 'after' });
        return updatedFavorite;
    }

    async deleteFavorite(favoriteId) {
        const favorite = await this.#favorites.findOneAndDelete({'_id':new ObjectId(favoriteId + '')});
        if (!favorite) {
            throw createError(404, `favorite object with ID ${favoriteId} doesn't exists`);
        }
        return favorite;
    }
}

const favoritesService = new FavoritesService();
export default favoritesService;