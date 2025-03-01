import Joi from "joi";
import config from "config"

export const email = Joi.string().email();
export const id = Joi.string().hex().length(24);
export const text = Joi.string().min(config.get("validation.text_min_length"));