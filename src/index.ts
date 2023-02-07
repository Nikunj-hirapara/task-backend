var morgan = require("morgan");
import redisClient from "./utils/redisHelper";
import path from "path";
const config = require("config");
import mongoose from "mongoose";
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
import helmet from "helmet";
import taskRoute from "./components/task";
import corsOptions from "./utils/corsOptions";
import { NextFunction, Request, Response } from "express";

express.application.prefix = express.Router.prefix = function (path: any, configure: any) {
    var router = express.Router();
    this.use(path, router);
    configure(router);
    return router;
};


const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));


const http = require("http");
const server = http.createServer(app);
const allowedLang = ['en', 'hi']
// const i18n = require("i18n-express");

app.use(function (req: Request, res: Response, next: NextFunction) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    if (!allowedLang.includes(req.headers.lang as string)) {
        req.headers.lang = 'en'
    }
    next();
});
app.use(cors(corsOptions));
app.use(cookieParser());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// app.use(morgan('dev', { skip: (req: any, res: any) => process.env.NODE_ENV === 'production' }));
app.use(morgan("dev"));

process.on('uncaughtException', (error, origin) => {
    console.log('----- Uncaught exception -----')
    console.log(error)
    console.log('----- Exception origin -----')
    console.log(origin)
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('----- Unhandled Rejection at -----')
    console.log(promise)
    console.log('----- Reason -----')
    console.log(reason)
})

app.prefix("/task", (route: any) => {
    taskRoute(route);    
});
// app.prefix("/user", (route: any) => {
//     authRoute(route);
//     userRoute(route);
// });

server.listen(config.get("PORT"), () => {
    console.log(`⚡️[NodeJs server]: Server is running at http://localhost:${config.get("PORT")}`);
    
    mongoose.connect(config.get("DB_CONN_STRING")).then(() => console.log("🐱 connected to mongodb.")).catch((e) => console.log("🛑 mongodb not connected " + e.message));
    });

//  "ROUTE_URL": "http://192.168.0.156:7009",
