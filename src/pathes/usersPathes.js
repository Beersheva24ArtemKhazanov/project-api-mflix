import config from "config";
const adminRole = config.get("accounting.admin_role");

const actionJwtAdmin = {
    authentication: req => "jwt",
    authorization: req => req.role === adminRole
};
const userPathes = {
    POST: {
        "/admin": {
            authentication: req => "basic",
            authorization: req => req.user === process.env.SUPERADMIN_USERNAME
        },
        "/user": {
            authentication: req => "",
            authorization: req => true
        },
        "/login": {
            authentication: req => "",
            authorization: req => true
        }
    },
    PUT: {
        "/role": actionJwtAdmin,
        "/": {
            authentication: req => "jwt",
            authorization: req => req.role === adminRole || req.user === req.body.email
        },
        "/block/": actionJwtAdmin,
        "/unblock/": actionJwtAdmin
    },
    GET: {
        "/": {
            authentication: req => "jwt",
            authorization: req => req.role === adminRole || req.user === req.body.email
        }
    },
    DELETE: {
        "/": {
            authentication: req => "jwt",
            authorization: req => req.role === adminRole || req.user === req.body.email
        }
    }
};
export default userPathes;