import config from "config";
import bcrypt from "bcrypt";
import { createError } from "../errors/errors.js";
import JwtUtils from "../security/JwtUtils.js";
import MongoService from "../db/MongoService.js";


const userRole = config.get("accounting.user_role");
const adminRole = config.get("accounting.admin_role");
const premRole = config.get("accounting.premium_user_role");
const time_units = {
    h: 3600 * 1000,
    d: 3600 * 1000 * 24,
    m: 60 * 1000,
    s: 1000,
    ms: 1,
};
const {
    MONGO_CONNECTION,
    MONGO_PASSWORD,
    MONGO_CLUSTER,
    DB_NAME,
    USERS_COLLECTION,
} = process.env;

class UserService {
    #mongoConnection;
    #accounts;
    constructor() {
        this.#mongoConnection = new MongoService(`${MONGO_CONNECTION}:${MONGO_PASSWORD}@${MONGO_CLUSTER}`, DB_NAME);
        this.#accounts = this.#mongoConnection.getCollection(USERS_COLLECTION);
    }

    async addAccount(account, role = userRole) {
        const acc = await this.#accounts.findOne({ _id: account.email });
        if (acc || account.email == process.env.SUPERADMIN_USERNAME) {
            throw createError(409, `account ${account.email} already exists`);
        }
        const serviceAccount = this.#toServiceAccount(account, role);
        await this.#accounts.insertOne(this.#toDbAccount(serviceAccount));
        return this.#toJSONAccount(serviceAccount);
    }

    addAdminAccount(account) {
        return this.addAccount(account, adminRole);
    }

    async setRole(email, role) {
        const acc = await this.getAccount(email);
        const updObj = { role: role };
        const serviceAccount = await this.#accounts.findOneAndUpdate({ _id: acc.email }, { $set: updObj }, { returnDocument: 'after' });
        return serviceAccount;
    }

    async getAccount(email) {
        const serviceAccount = await this.#accounts.findOne({ _id: email });
        if (!serviceAccount) {
            throw createError(404, `account ${email} doesn't exist`);
        }
        return this.#toJSONAccount(serviceAccount);
    }

    async updateAccount(account) {
        const serviceAccount = await this.getAccount(account.email);
        this.#updatePassword(serviceAccount, account.password);
        const updatingObj = { hashPassword: serviceAccount.hashPassword };
        await this.#accounts.findOneAndUpdate({ _id: account.email }, { $set: updatingObj });
    }

    #updatePassword(serviceAccount, newPassword) {
        if (bcrypt.compareSync(newPassword, serviceAccount.hashPassword)) {
            throw createError(
                400,
                `new password should be different from the existing one`
            );
        }
        serviceAccount.hashPassword = bcrypt.hashSync(
            newPassword,
            config.get("accounting.salt_rounds")
        );
        serviceAccount.expiration = getExpiration();
    }

    #toDbAccount(account) {
        const { email, name, role, hashPassword, expiration, blocked } = account;
        return { _id: email, name, role, hashPassword, expiration, blocked };
    }

    #toJSONAccount(account) {
        const { _id, name, role, hashPassword, expiration, blocked } = account;
        return { email: _id, name, role, hashPassword, expiration, blocked };
    }

    #toServiceAccount(account, role) {
        const hashPassword = bcrypt.hashSync(
            account.password,
            config.get("accounting.salt_rounds")
        );
        const expiration = getExpiration();
        const serviceAccount = {
            email: account.email,
            name: account.name,
            role,
            hashPassword,
            expiration,
            blocked: false
        };
        return serviceAccount;
    }

    async getUserSessionInformation(email) {
        let { sessionStartTime, sessionCount } = await this.getAccount(email);
        const timeRange = getExpirationIn(config.get("limitation.user_sessions_time"));
        const now = new Date().getTime();
        if (sessionStartTime + timeRange < now || !sessionStartTime) {
            sessionCount = 1;
            sessionStartTime = now;
        } else {
            sessionCount++;
        }
        const updObj = { sessionStartTime, sessionCount };
        await this.#accounts.findOneAndUpdate({ email: email },{ $set:updObj }
        );
        return updObj;
    }

    async blockAccount(email) {
        const updObj = { blocked: true };
        await this.#accounts.findOneAndUpdate({ _id: email }, { $set: updObj })
    }

    async unBlockAccount(email) {
        const updObj = { blocked: false };
        await this.#accounts.findOneAndUpdate({ _id: email }, { $set: updObj })
    }

    async deleteAccount(email) {
        const account = await this.#accounts.findOneAndDelete({ _id: email });
        if (!account) {
            throw Error(`account ${email} not found`)
        }
    }

    async login(account) {
        const { email, password } = account;
        const serviceAccount = await this.getAccount(email);
        await this.checkLogin(serviceAccount, password);
        return JwtUtils.getJwt(serviceAccount);
    }

    async checkLogin(serviceAccount, password) {
        if (
            !serviceAccount ||
            !await bcrypt.compare(password, serviceAccount.hashPassword)
        ) {
            throw createError(400, "Wrong credentials");
        }
        if (new Date().getTime() > serviceAccount.expiration) {
            throw createError(400, "Account's password is expired");
        }
    }
}

const userService = new UserService();
export default userService;

function getExpiration() {
    const expiredIn = getExpirationIn(config.get("accounting.expiredIn"));
    return new Date().getTime() + expiredIn;
}

export function getExpirationIn(expiredInStr) {
    const amount = expiredInStr.split(/\D/)[0];
    const parseArray = expiredInStr.split(/\d/);
    const index = parseArray.findIndex((e) => !!e.trim());
    const unit = parseArray[index];
    const unitValue = time_units[unit];
    if (!unitValue) {
        throw createError(500, `Wrong configuration: unit ${unit} doesn't exist`);
    }
    return amount * unitValue;
}