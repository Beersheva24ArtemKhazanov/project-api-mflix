import express from "express";
import { auth } from "../middleware/auth.js";
import commentsService from "../service/CommentsService.js";
import { errorHandler } from "../errors/errors.js";
import commentsPathes from "../pathes/commentsPathes.js";
import { validator } from "../middleware/validation.js";
import { schemaAddComment, schemaUpdateComment } from "../validation/commentsShemas.js";
import { schemaId } from "../validation/moviesSchemas.js";
import { schemaEmail } from "../validation/userSchemas.js";


const commentsRoute = express.Router();
commentsRoute.use(auth(commentsPathes));
commentsRoute.post("/", validator(schemaAddComment), (req, res) => {
    commentsService.addComment(req.body, req.user).then(comment => {
        res.status(201).send(comment);
    }).catch(e => errorHandler(e, req, res));
});
commentsRoute.get("/movie", validator(schemaId), (req, res) => {
    commentsService.getMovieComments(req.body.id).then(comments => {
        res.send(comments);
    }).catch(e => errorHandler(e, req, res));
});
commentsRoute.get("/user", validator(schemaEmail), (req, res) => {
    commentsService.getUserComments(req.body.email).then(comments => {
        res.send(comments);
    }).catch(e => errorHandler(e, req, res));
});
commentsRoute.put("/", validator(schemaUpdateComment), (req, res) => {
    commentsService.updateComment(req.body).then(comment => {
        res.send(comment);
    }).catch(e => errorHandler(e, req, res));
});
commentsRoute.delete("/", validator(schemaId), (req, res) => {
    commentsService.deleteComment(req.body.commentId).then(comment => {
        res.send(comment);
    }).catch(e => errorHandler(e, req, res));
});

export default commentsRoute;
