const config = require("config");

export const AppConstants = {
    API_ROUTE_SOCKET: "",
    IMAGE_PATH: config.get("ROUTE_URL") + "/uploads/images/",
    USER_IMAGE_PATH: config.get("ROUTE_URL") + "/uploads/images/",
    USER_AUDIO_PATH: config.get("ROUTE_URL") + "/uploads/audio/",
    SYNC_TYPE_MESSAGE_STATUS: "SYNC_MESSAGE_STATUS",

    MODEL_TASK: "Task",

    TOKEN_EXPIRY_TIME: "5m",
    DATE_FORMAT: "yyyy-MM-DD HH:mm:ss.SSS",
    DATE_FORMAT_SHORT: "yyyy-MM-DD HH:mm:ss",
};

declare global {
    interface String {
        isExists(): boolean;
        isEmpty(): boolean;
    }

    interface Number {
        isExists(): boolean;
    }

    interface Boolean {
        isExists(): boolean;
    }
}

String.prototype.isExists = function () {
    return !(typeof this == "undefined" || this == null);
};
String.prototype.isEmpty = function () {
    return this == "";
};

Number.prototype.isExists = function () {
    return !(typeof this == "undefined" || this == null);
};

Boolean.prototype.isExists = function () {
    return !(typeof this == "undefined" || this == null);
};
