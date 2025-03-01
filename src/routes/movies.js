import express from "express";
import { auth } from "../middleware/auth.js";
import moviesService from "../service/MoviesService.js";
import { errorHandler } from "../errors/errors.js";
import moviesPathes from "../pathes/moviesPathes.js";
import { validator } from "../middleware/validation.js";
import { schemaFilter, schemaId, schemaRating } from "../validation/moviesSchemas.js";


const moviesRoute = express.Router();
moviesRoute.use(auth(moviesPathes));
moviesRoute.get("/", validator(schemaId), (req, res) => {
    moviesService.getMovie(req.body.id).then(movie => {
        res.send(movie);
    }).catch(e => errorHandler(e, req, res));
});
moviesRoute.get("/rated", validator(schemaFilter), (req, res) => {
    moviesService.getMostRated(req.body).then(movies => {
        res.send(movies);
    }).catch(e => errorHandler(e, req, res));
});
moviesRoute.get("/commented", validator(schemaFilter), (req, res) => {
    moviesService.getMostCommented(req.body).then(movies => {
        res.send(movies);
    }).catch(e => errorHandler(e, req, res));
});
moviesRoute.put("/", validator(schemaRating), (req, res) => {
    moviesService.addRate(req.body).then(count => {
        res.send(count);
    }).catch(e => errorHandler(e, req, res));
});

export default moviesRoute;
