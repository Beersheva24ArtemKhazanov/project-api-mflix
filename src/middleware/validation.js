import { createError } from "../errors/errors.js";
export function expressValidator(schemasObj) {
  return (req, res, next) => {
    if (req._body) {
      const { error } = schemasObj[req.method].validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        req.errorMessage = error.details.map((d) => d.message).join(";");
      }
      req.validated = true;
    }
    next();
  };
}
export function validator(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      throw createError(400, error.details.map((d) => d.message).join(";"));
    }
    next();
  };
}