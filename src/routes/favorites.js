import express from "express";
import { auth } from "../middleware/auth.js";
import favoritesService from "../service/FavoritesService.js";
import { errorHandler } from "../errors/errors.js";
import { validator } from "../middleware/validation.js";
import { schemaAddFavorite, schemaDeleteFavorite, schemaUpdateFavorite } from "../validation/favoritesSchemas.js";
import { schemaEmail } from "../validation/userSchemas.js";
import favoritesPathes from "../pathes/favoritesPathes.js";


const favoritesRoute = express.Router();
favoritesRoute.use(auth(favoritesPathes));
favoritesRoute.post("/", validator(schemaAddFavorite), (req, res) => {
    favoritesService.addFavorite(req.body).then(favorite => {
        res.send(favorite);
    }).catch(e => errorHandler(e, req, res));
});
favoritesRoute.get("/", validator(schemaEmail), (req, res) => {
    favoritesService.getUserFavorites(req.body.email).then(favorites => {
        res.send(favorites);
    }).catch(e => errorHandler(e, req, res));
});
favoritesRoute.put("/", validator(schemaUpdateFavorite), (req, res) => {
    favoritesService.updateFavorite(req.body).then(favorite => {
        res.send(favorite);
    }).catch(e => errorHandler(e, req, res));
});
favoritesRoute.delete("/", validator(schemaDeleteFavorite), (req, res) => {
    favoritesService.deleteFavorite(req.body.id).then(favorite => {
        res.send(favorite);
    }).catch(e => errorHandler(e, req, res));
});

export default favoritesRoute;
