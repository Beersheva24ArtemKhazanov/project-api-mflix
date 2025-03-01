import config from "config";
import favoritesService from "../service/FavoritesService.js";

const premiumRole = config.get("accounting.premium_user_role");

const favoritesPathes = {
    POST: {
        "/": {
            authentication: req => "jwt",
            authorization: req => req.role === premiumRole
        }
    },
    GET: {
        "/": {
            authentication: req => "jwt",
            authorization: req => req.role === premiumRole && req.user === req.body.email
        }
    },
    PUT: {
        "/": {
            authentication: req => "jwt",
            authorization: async req => {
                const favorite = await favoritesService.getFavorite(req.body.favoriteId);
                return req.role === premiumRole && req.user === favorite.email;
            }
        }
    },
    DELETE: {
        "/": {
            authentication: req => "jwt",
            authorization: async req => {
                const favorite = await favoritesService.getFavorite(req.body.favoriteId);
                return req.role === premiumRole && req.user === favorite.email;
            }
        }
    }
};
export default favoritesPathes;