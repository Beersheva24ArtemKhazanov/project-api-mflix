import config from "config";
import userService from "../service/UserService.js";

const userRole = config.get("accounting.user_role");
const adminRole = config.get("accounting.admin_role");
const premiumRole = config.get("accounting.premium_user_role");
const userSessionLimit = config.get("limitation.user_sessions_count");

const getAuthorization = async req => {
    const res = req.role !== adminRole
    if (req.role === userRole) {
        const {sessionCount} = await userService.getUserSessionInformation(req.user);
        res = res && sessionCount <= userSessionLimit;
    }
    return res;
}

const moviesPathes = {
    PUT: {
        "/": {
            authentication: req => "jwt",
            authorization: req => req.role === premiumRole
        },
    },
    GET: {
        "/": {
            authentication: req => "jwt",
            authorization: getAuthorization
        },
        "/rated": {
            authentication: req => "jwt",
            authorization: getAuthorization
        },
        "/commented": {
            authentication: req => "jwt",
            authorization: getAuthorization
        },
    },
};
export default moviesPathes;