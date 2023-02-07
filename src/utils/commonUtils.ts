import { AppConstants } from "./appConstants";
import moment from "moment";
import express, { NextFunction, Request, Response } from "express";
type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void
const path = require('path')
const os = require('os')
const md5 = require("md5");

const getRootDir = () => path.parse(process.cwd()).root
const getHomeDir = () => os.homedir()
const getPubDir = () => "./public"


function formatDate(date: any) {
    return moment(date).format(AppConstants.DATE_FORMAT)
}

async function sendSuccess(req: Request, res: Response, data: any, statusCode = 200) {
    return res.status(statusCode).send(data)
}

async function sendAdminSuccess(req: Request, res: Response, data: any, statusCode = 200) {
    return res.status(statusCode).send(data)
}
async function sendAdminError(req: Request, res: Response, data: any, statusCode = 422) {
    return res.status(statusCode).send(data)
}

async function sendError(req: Request, res: Response, data: any, statusCode = 422) {
    return res.status(statusCode).send(data)
}

function getCurrentUTC(format = AppConstants.DATE_FORMAT, addMonth: any = null, addSeconds: number = 0) {
    // console.log(moment.utc(new Date()).format("YYYY-MM-DD HH:mm:ss"));
    if (addMonth != null) {
        return moment.utc(new Date()).add(addMonth, 'M').format(format);
    } else if (addSeconds > 0) {
        return moment.utc(new Date()).add(addSeconds, 'seconds').format(format);
    } else {
        return moment.utc(new Date()).add().format(format);
    }
}

function formattedErrors(err: any) {
    let transformed: any = {};
    Object.keys(err).forEach(function (key, val) {
        transformed[key] = err[key][0];
    })
    return transformed
}
const routeArray = (array_: any, prefix: any, isAdmin: Boolean = false) => {
    // path: "", method: "post", controller: "",validation: ""(can be array of validation), 
    // isEncrypt: boolean (default true), isPublic: boolean (default false)

    array_.forEach((route: any) => {
        const method = route.method as "get" | "post" | "put" | "delete" | "patch";
        const path = route.path;
        const controller = route.controller;
        const validation = route.validation;
        let middlewares = [];
        const isEncrypt = route.isEncrypt === undefined ? true : route.isEncrypt;
        const isPublic = route.isPublic === undefined ? false : route.isPublic;
        if (validation) {
            if (Array.isArray(validation)) {
                middlewares.push(...validation);
            } else {
                middlewares.push(validation);
            }
        }
        middlewares.push(controller);
        prefix[method](path, ...middlewares);
    })

    return prefix;
}



const generateUniqueId = () => {
    // generate random string
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
}

export default {
    getCurrentUTC,
    sendSuccess,
    sendError,
    formattedErrors,
    getRootDir,
    getHomeDir,
    getPubDir,
    formatDate,
    routeArray,
    sendAdminSuccess,
    sendAdminError,
    generateUniqueId,
    uuidv4
}