import MongoService from "../db/MongoService.js";
import { ObjectId } from "mongodb";
import moviesService from "./MoviesService.js";
import { createError } from "../errors/errors.js";
import userService from "./UserService.js";


const {
    MONGO_CONNECTION,
    MONGO_PASSWORD,
    MONGO_CLUSTER,
    DB_NAME,
    COMMENTS_COLLECTION,
} = process.env;

class CommentsService {
    #mongoConnection;
    #comments
    constructor() {
        this.#mongoConnection = new MongoService(`${MONGO_CONNECTION}:${MONGO_PASSWORD}@${MONGO_CLUSTER}`, DB_NAME);
        this.#comments = this.#mongoConnection.getCollection(COMMENTS_COLLECTION);
    }

    async getMovieComments(movieId) {
        const comments = await this.#comments.aggregate([
            {
              '$match': {
                'movie_id': new ObjectId(movieId + '')
              }
            }, {
              '$project': {
                'email': 1, 
                'text': 1
              }
            }
          ]).toArray();
        return comments;
    }

    async getComment(commentId) {
        const comment  = await this.#comments.findOne({_id: new ObjectId(commentId + '')});
        return comment;
    }

    async addComment(comment, email) {
        const user = await userService.getAccount(email);
        comment.name = user.name;
        const commentary = this.#toDbComment(comment);
        await this.#insertComment(commentary);
        await moviesService.incrementComment(comment.movieId);
        return commentary;
    }

    async #insertComment(comment) {
        return await this.#comments.insertOne(comment)
    }

    #toDbComment(comment) {
        const { name, email, movieId, text } = comment;
        return { name, email, movie_id: new ObjectId(movieId + ''), text, date: new Date().toISOString() }
    }

    async updateComment(data) {
        const { commentId, text } = data;
        const comment = await this.#comments.findOneAndUpdate({_id: new ObjectId(commentId + '') }, { $set: { 'text': text, 'date': new Date().toISOString() } }, { returnDocument: 'after' });
        return comment;
    }

    async getUserComments(email) {
        const comments = await this.#comments.find({ 'email': email }).toArray();
        return comments;
    }

    async deleteComment(commentId) {
        const comment = await this.#comments.findOneAndDelete({ _id: new ObjectId(commentId + '') });
        if (!comment) {
            throw createError(404,`Comment with id ${commentId} doesn't exists`);
        }
        await moviesService.decrementComment(comment.movie_id);
        return comment;
    }
}

const commentsService = new CommentsService();
export default commentsService;