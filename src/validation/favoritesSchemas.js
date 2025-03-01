import Joi from "joi";
import { email, id, text } from "./mainFieldsSchemas.js";

const viewed = Joi.boolean();

export const schemaAddFavorite = Joi.object({
    email: email.required(),
    movie_id: id.required(),
    feed_back: text,
    viewed
});
export const schemaUpdateFavorite = Joi.object({
    favoriteId: id.required(),
    viewed,
    feed_back: text
});
export const schemaDeleteFavorite = Joi.object({
    favoriteId: id.required()
});