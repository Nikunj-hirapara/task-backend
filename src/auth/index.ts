import { Request, Response } from "express";
import commonUtils from "../utils/commonUtils";
import aes from "../utils/aes";
import redisClient from "../utils/redisHelper";
import mongoose from "mongoose";
import { UserType } from "../utils/enum";
import { AppStrings } from "../utils/appStrings";
const User = require("../components/users/userModel");
const jwt = require('jsonwebtoken');
const config = require("config");
type ObjectId = mongoose.Schema.Types.ObjectId;

const login = async (userId: ObjectId, userType: UserType, createdAt: Date) => {
    let uniqueUserKey = aes.encrypt(
        JSON.stringify({
            "userId": userId,
            "userType": userType,
            "createdAt": createdAt
        }), config.get("OUTER_KEY_USER"))

    let payload = await aes.encrypt(uniqueUserKey, config.get("OUTER_KEY_PAYLOAD"))

    const accessToken = jwt.sign({ sub: payload }, config.get("JWT_ACCESS_SECRET"), { expiresIn: config.get("JWT_ACCESS_TIME") });

    const refreshToken = await generateRefreshToken(payload);

    let data = { accessToken: accessToken, refreshToken: refreshToken }
    await redisClient.lpush(uniqueUserKey.toString(), JSON.stringify(data));

    return data;
}

const logout = async (req: any, res: Response) => {
    const LANG = req.headers.lang as string ?? 'en';

    const tokens_ = req.headers?.authorization?.split(' ') ?? []
    if (tokens_.length <= 1) {
        return commonUtils.sendError(req, res, { message: AppStrings[LANG].INVALID_TOKEN }, 403);
    }
    const token = tokens_[1];
    var decoded = jwt.decode(token);
    if (!decoded?.sub) {
        return commonUtils.sendError(req, res, { message: AppStrings[LANG].INVALID_TOKEN }, 403);
    }
    console.log(req.headers.userid, '123');

    const uniqueUserKey = aes.decrypt(decoded.sub, config.get("OUTER_KEY_PAYLOAD"))
    let tokens: [] = await redisClient.lrange(uniqueUserKey.toString(), 0, -1)
    let index = tokens.findIndex(value => JSON.parse(value).accessToken.toString() == token.toString())

    // remove the refresh token and // blacklist current access token
    await redisClient.lrem(uniqueUserKey.toString(), 1, await redisClient.lindex(uniqueUserKey.toString(), index));
    await redisClient.lpush('BL_' + uniqueUserKey.toString(), token);
    
    const userToken = await User.findByIdAndUpdate({ _id: new mongoose.Types.ObjectId(req.headers.userid) }, { pushToken: null });
    console.log(userToken,'logout');
    
    return commonUtils.sendSuccess(req, res, {}, 204);
}

const getAccessTokenPromise = async (oldToken: any, req: Request) => {
    const LANG = req.headers.lang as string ?? 'en';

    return new Promise((resolve, reject) => {
        jwt.verify(oldToken, config.get("JWT_REFRESH_SECRET"), async (err: any, user: any) => {
            if (err) {
                return reject({ status: 403 });
            } else {
                const uniqueUserKey = aes.decrypt(user.sub, config.get("OUTER_KEY_PAYLOAD"))

                let tokens: [] = await redisClient.lrange(uniqueUserKey, 0, -1)
                let token_ = tokens.find(value => JSON.parse(value).refreshToken.toString() == oldToken.toString())

                if (!token_) return reject({ error: AppStrings[LANG].INVALID_TOKEN, status: 403 });

                let index = tokens.findIndex(value => JSON.parse(value).refreshToken.toString() == oldToken.toString())

                let payload = aes.encrypt(uniqueUserKey.toString(), config.get("OUTER_KEY_PAYLOAD"))

                const accessToken = jwt.sign({ sub: payload }, config.get("JWT_ACCESS_SECRET"), { expiresIn: config.get("JWT_ACCESS_TIME") });
                const refreshToken = await generateRefreshToken(payload);

                let data = { accessToken: accessToken, refreshToken: refreshToken }

                await redisClient.lset(uniqueUserKey.toString(), index, JSON.stringify(data));

                return resolve({ accessToken, refreshToken })
            }
        })
    })
}

const getAccessToken = async (req: any, res: Response) => {
    const LANG = req.headers.lang as string ?? 'en';

    const tokens_ = req.headers?.authorization?.split(' ') ?? []
    if (tokens_.length <= 1) {
        return commonUtils.sendError(req, res, { message: AppStrings[LANG].INVALID_TOKEN }, 401);
    }
    const oldToken = tokens_[1];
    getAccessTokenPromise(oldToken, req).then((result: any) => {
        const { refreshToken, accessToken } = result
        res.cookie("accessToken", accessToken, { maxAge: 900000, httpOnly: true });
        res.cookie("refreshToken", refreshToken, { maxAge: 900000, httpOnly: true });
        return commonUtils.sendSuccess(req, res, {});
    }).catch((err: any) => {
        return commonUtils.sendAdminError(req, res, { message: err?.error }, err.status)
    })
}


const getAdminRefreshToken = async (req: any, res: Response) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.sendStatus(403);

    getAccessTokenPromise(refreshToken, req).then((result: any) => {
        const { refreshToken, accessToken } = result
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, maxAge: 24 * 60 * 60 * 1000 });
        return commonUtils.sendAdminSuccess(req, res, { accessToken })
    }).catch((err: any) => {
        return commonUtils.sendAdminError(req, res, { message: err?.error }, err.status)
    })
}

const generateRefreshToken = async (payload: string) => {
    return jwt.sign({ sub: payload }, config.get("JWT_REFRESH_SECRET"), { expiresIn: config.get("JWT_REFRESH_TIME") });
}

export default {
    login,
    logout,
    getAccessToken,
    generateRefreshToken,
    getAdminRefreshToken
}