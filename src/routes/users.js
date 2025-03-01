import express from "express";
import { auth } from "../middleware/auth.js";
import userService from "../service/UserService.js";
import { errorHandler } from "../errors/errors.js";
import { validator } from "../middleware/validation.js";
import { schemaEmail, schemaEmailNamePassword, schemaEmailPassword, schemaEmailRole } from "../validation/userSchemas.js";
import userPathes from "../pathes/usersPathes.js";


const usersRoute = express.Router();
usersRoute.use(auth(userPathes));
usersRoute.post("/admin", validator(schemaEmailNamePassword), (req, res) => {
    userService.addAdminAccount(req.body).then(user => {
        res.status(201).send(user);
    }).catch(e => errorHandler(e, req, res));
});
usersRoute.post("/user", validator(schemaEmailNamePassword), (req, res) => {
    userService.addAccount(req.body).then(user => {
        res.send(user);
    }).catch(e => errorHandler(e, req, res));
});
usersRoute.put("/role", validator(schemaEmailRole), (req, res) => {
     userService.setRole(req.body.email, req.body.role).then(user => {
        res.send(user);
    }).catch(e => errorHandler(e, req, res));
});
usersRoute.get("/", validator(schemaEmail), (req, res) => {
    userService.getAccount(req.body.email).then(user => {
        res.send(user);
    }).catch(e => errorHandler(e, req, res));
});
usersRoute.put("/", validator(schemaEmailPassword), (req, res) => {
    userService.updateAccount(req.body).then(() => {
        res.send("account updated");
    }).catch(e => errorHandler(e, req, res));
});
usersRoute.put("/block", validator(schemaEmail), (req, res) => {
    userService.blockAccount(req.body.email).then(() => {
        res.send("account updated");
    }).catch(e => errorHandler(e, req, res));
});
usersRoute.put("/unblock", validator(schemaEmail), (req, res) => {
    userService.unBlockAccount(req.body.email).then(() => {
        res.send("account updated");
    }).catch(e => errorHandler(e, req, res));
});
usersRoute.delete("/", validator(schemaEmail), (req, res) => {
    userService.deleteAccount(req.body.email).then(() => {
        res.send("account deleted");
    }).catch(e => errorHandler(e, req, res))
});
usersRoute.post("/login", (req, res) => {
    userService.login(req.body).then(token => {
        res.send(token);
    }).catch(e => errorHandler(e, req, res));
});

export default usersRoute;
