import Joi from "joi";
import { id } from "./mainFieldsSchemas.js";
import config from "config";

const currentYear = new Date().getFullYear();

const imdbId = Joi.number();
const rating = Joi.number().integer().greater(0).less(11);
const actor = Joi.string().regex(/^[A-Za-z ]+$/);
const amount = Joi.number().min(1).max(config.get("validation.max_amount"));
const genres = Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  );
const languages = Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  );
const year = Joi.number().min(config.get("validation.min_movie_year")).max(currentYear);

export const schemaId = Joi.object({
    id: id.required()
});
export const schemaFilter = Joi.object({
    year,
    actor,
    genres,
    languages,
    amount
});
export const schemaRating = Joi.object({
    id: imdbId.required(),
    rating: rating.required()
});