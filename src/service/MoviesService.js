import MongoService from "../db/MongoService.js";
import { ObjectId } from "mongodb";
import { createError } from "../errors/errors.js";


const {
    MONGO_CONNECTION,
    MONGO_PASSWORD,
    MONGO_CLUSTER,
    DB_NAME,
    MOVIES_COLLECTION,
} = process.env;

class MoviesSerivce {
    #mongoConnection;
    #movies
    constructor() {
        this.#mongoConnection = new MongoService(`${MONGO_CONNECTION}:${MONGO_PASSWORD}@${MONGO_CLUSTER}`, DB_NAME);
        this.#movies = this.#mongoConnection.getCollection(MOVIES_COLLECTION);
    }

    async getMovie(id) {
        const movie = await this.#movies.findOne({_id: new ObjectId(`${id}`)});
        if (!movie) {
            throw createError(404, `movie with id ${id} doesn't exist`)
        }
        return movie;
    }

    async incrementComment(id) {
        await this.#movies.updateOne(
            { "_id": new ObjectId(id +'') },
            { "$inc": { "num_mflix_comments": 1 } }
        );
    }                                                                                                  

    async getMostRated(filter) {
        const {amount, ...rest} = filter;
        const actualFilter = [
            {
                '$match': rest
            }, {           
                '$match': {
                    'imdb.rating': {
                        '$exists': true,
                        '$ne': ''
                    }
                }
            }, {
                '$sort': {
                    'imdb.rating': -1
                }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
            }, {
                '$project':
                {
                    '_id': 1,
                    'title': 1,
                    'indbId': "$imdb.id",
                    'rating': "$imdb.rating"
                }
            }
        ]
        if (amount) {
            actualFilter.push({'$limit': filter.amount});
        }
        const movies = await this.#movies.aggregate(actualFilter).toArray();
        return movies;
    }

    async getMostCommented(filter) {
        const actualFilter = [
            {
                '$match': filter
            }, {
                '$sort': {
                    'num_mflix_comments': -1
                }
            },{
                '$project':
                  {
                    '_id': 1,
                    'title': 1,
                    'indbId': "$imdb.id",
                    'comments': "$num_mflix_comments"
                  }
              }
        ]
        const movies = await this.#movies.aggregate(actualFilter).toArray();
        return movies;
    }

    async addRate(myRating) {
        const movie = await this.#movies.findOne({ "imdb.id": myRating.id });
        const { id, rating, votes } = movie.imdb;
        const newRating = (rating * votes + myRating.rating) / (votes + 1);
        const updObj = { id, votes: votes + 1, rating: newRating }
        const movies = await this.#movies.updateMany({ "imdb.id": id }, { $set: { imdb: updObj }});
        return {"moviesUpdated":movies.modifiedCount};
    }
}

const moviesService = new MoviesSerivce();
export default moviesService;