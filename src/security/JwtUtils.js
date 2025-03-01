import jwt from 'jsonwebtoken';
import config from "config";
import { getExpirationIn } from '../service/UserService.js';
export default class JwtUtils {
    static getJwt(serviceUser) {
       return jwt.sign({role: serviceUser.role}, process.env.JWT_SECRET, {
        subject:serviceUser.email,
        expiresIn: getExpirationIn(config.get("accounting.expiredIn")) + ""
       })
    }
    static verifyJwt(token) {
       return jwt.verify(token, process.env.JWT_SECRET);
    }
}