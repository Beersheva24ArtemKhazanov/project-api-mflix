import express from "express";
import { authenticate } from "../middleware/auth.js";
import { errorHandler } from "../errors/errors.js"; 
import usersRoute from "../routes/users.js";
import moviesRoute from "../routes/movies.js";
import commentsRoute from "../routes/comments.js";
import favoritesRoute from "../routes/favorites.js";
import logger from "../loggers/winston.js";
import { loggerMorgan } from "../loggers/morgan.js";


const app = express();
const port = process.env.PORT || 3500;
app.use(express.json());
app.use(loggerMorgan);
app.use(authenticate());
app.use('/users', usersRoute);
app.use('/movies', moviesRoute);
app.use('/comments', commentsRoute);
app.use('/favorites', favoritesRoute);
app.use((req, res) => {
  logger.warn(`Path ${req.path} is not found`);
  res.status(404).send(`path ${req.path} is not found`)
})
app.listen(port, () => console.log(`server is listening on port ${port}`));
app.use(errorHandler);