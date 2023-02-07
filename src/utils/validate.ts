import { NextFunction, Request, Response } from "express";
import commonUtils from "./commonUtils";
import moment from "moment";
import mongoose from "mongoose";
import { AppConstants } from "./appConstants";
import { UserType } from "./enum";
type DateArray = [string, string];

const Validator = require('validatorjs');

const validatorUtil = (body: any, rules: any, customMessages: any, callback: Function) => {
    const validation = new Validator(body, rules, customMessages);
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors.errors, false));
};

const validatorUtilWithCallback = (rules: any, customMessages: any, req: Request, res: Response, next: NextFunction) => {
    const LANG = req.headers.lang as string ?? 'en';
    Validator.useLang(LANG)
    const validation = new Validator(req.body, rules, customMessages);
    
    validation.passes(() => next());

    validation.fails(() => {
        return commonUtils.sendError(req, res, {errors: commonUtils.formattedErrors(validation.errors.errors)})
    });
};

Validator.registerAsync('exist_value', function (value: any, attribute: any, req: Request, passes: any) {
    if (!attribute) throw new Error('Specify Requirements i.e fieldName: exist:table,column');

    let attArr = attribute.split(",");

    if (attArr.length !== 3) throw new Error(`Invalid format for validation rule on ${attribute}`);
    const { 0: table, 1: column, 2: _id } = attArr;

    let msg = (column == "username") ? `name has already been taken ` : `${column} already in use`

    mongoose.model(table).findOne({ [column]: value, _id: { $ne: _id } }).then((result: any) => {
        if (result) {
            passes(false, msg);
        } else {
            passes();
        }
    }).catch((err: any) => {
        passes(false, err);
    });
});

Validator.registerAsync('exist_value_with_type', function (value: any, attribute: any, req: Request, passes: any) {
    if (!attribute) throw new Error('Specify Requirements i.e fieldName: exist:table,column');

    let attArr = attribute.split(",");
    if (attArr.length !== 4) throw new Error(`Invalid format for validation rule on ${attribute}`);
    const { 0: table, 1: column, 2: _id, 3: usertype } = attArr;

    let msg = (column == "username") ? `${column} has already been taken ` : `${column} already in use`

    mongoose.model(table).findOne({ [column]: value, usertype: usertype, _id: { $ne: _id } }).then((result: any) => {
        if (result) {
            passes(false, msg);
        } else {
            passes();
        }
    }).catch((err: any) => {
        passes(false, err);
    });
});

Validator.registerAsync('exist', function (value: any, attribute: any, req: Request, passes: any) {
    if (!attribute) throw new Error('Specify Requirements i.e fieldName: exist:table,column');

    let attArr = attribute.split(",");
    if (attArr.length !== 2) throw new Error(`Invalid format for validation rule on ${attribute}`);
    const { 0: table, 1: column } = attArr;

    let msg = (column == "username") ? `name has already been taken ` : `${column} already in use`

    mongoose.model(table).findOne({ [column]: value }).then((result: any) => {
        if (result) {
            console.log('error from here', msg);            
            passes(false, msg);
        } else {
            console.log('sucess from here');
            passes();
        }
    }).catch((err: any) => {
        console.log('error from here', err.message);
        passes(false, err);
    });
});

Validator.registerAsync('exist_with_type', function (value: any, attribute: any, req: Request, passes: any) {
    if (!attribute) throw new Error('Specify Requirements i.e fieldName: exist:table,column,usertype');

    let attArr = attribute.split(",");

    if (attArr.length !== 3) throw new Error(`Invalid format for validation rule on ${attribute}`);
    const { 0: table, 1: column, 2: usertype } = attArr;
    let msg = (column == "username") ? `${column} has already been taken ` : `${column.charAt(0).toUpperCase() + column.slice(1)} already in use`
    // let msg = (column == "username") ? `${column} has already been taken ` : `${column} already in use`;

    mongoose.model(table).findOne({ [column]: value, usertype: usertype }).then((result: any) => {
        if (result) {
            passes(false, msg);
        } else {
            passes();
        }
    }).catch((err: any) => {
        passes(false, err);
    });
});

// valid_date function
Validator.registerAsync('valid_date', function (value: any, attribute: any, req: Request, passes: any) {
    if (moment(value, 'YYYY-MM-DD', true).isValid()) {
        passes();
    } else {
        passes(false, 'Invalid date format, it should be YYYY-MM-DD');
    }
});

//must_from:table,column
Validator.registerAsync('must_from', function (value: any, attribute: any, req: Request, passes: any) {
    if (!attribute) throw new Error('Specify Requirements i.e fieldName: must_from:table,column');

    let attArr = attribute.split(",");
    if (attArr.length < 2 || attArr.length > 3) throw new Error('Specify Requirements i.e fieldName: must_from:table,column');
    const { 0: table, 1: column } = attArr;

    let msg = `${column} must be from ${table}`;

    mongoose.model(table).findOne({ [column]: value }).then((result: any) => {
        if (result) {
            passes();
        } else {
            passes(false, msg);
        }
    }).catch((err: any) => {
        passes(false, err);
    });
})


Validator.registerAsync('validObjectId', function (value: any, attribute: any, req: Request, passes: any) {
    if (value) {
        if (mongoose.Types.ObjectId.isValid(value) && typeof value === 'string') {
            passes();
        } else {
            passes(false, 'Invalid ObjectId');
        }
    }
});

Validator.registerAsync('date_before_today', function (value: any, attribute: any, req: Request, passes: any) {
    if (value) {
        if (moment(value).isBefore(moment())) {
            passes();
        } else {
            passes(false, `${value} must be before today`);
        }
    }
});

Validator.registerAsync('date_after_today_or_same', function (value: any, attribute: any, req: Request, passes: any) {
    if (value) {
        if (moment(value, 'YYYY-MM-DD').isAfter(moment().format('YYYY-MM-DD'))
            || moment(value, 'YYYY-MM-DD').isSame(moment().format('YYYY-MM-DD'))) {
            passes();
        } else {
            passes(false, `${value} must be after today`);
        }
    }
});

Validator.registerAsync('valid_time', function (value: any, attribute: any, req: Request, passes: any) {
    if (value) {
        if (moment(value, 'hh:mm a', true).isValid()) {
            passes();
        } else {
            passes(false, 'Invalid time');
        }
    }
});

Validator.registerAsync('date_after', function (value: any, attribute: DateArray, req: Request, passes: any) {
    try {
        if (value && attribute) {
            const { 0: field, 1: date } = attribute;
            const dateAfter = moment(date, 'YYYY-MM-DD', true);

            if (Array.isArray(value)) {
                const dateArr = value.map((date: any) => moment(date, 'YYYY-MM-DD', true));
                const unique = value.filter((v, i, a) => a.indexOf(v) === i);
                if (unique.length !== dateArr.length) {
                    passes(false, `${field} must be unique`);
                }
                const isValid = dateArr.every((date: any) => date.isAfter(dateAfter));
                if (isValid) {
                    passes();
                } else {
                    passes(false, `${field} must be after ${date}`);
                }
            } else {
                const dateValue = moment(value, 'YYYY-MM-DD', true);
                if (dateValue.isAfter(dateAfter)) {
                    passes();
                } else {
                    passes(false, `${field} must be after ${date}`);
                }
            }
        }
    } catch (error) {
        passes(false, `${value} must be after ${attribute}`);
    }
});

Validator.registerAsync('date_before', function (value: any, attribute: any, req: Request, passes: any) {
    if (!attribute) throw new Error('Specify Requirements i.e fieldName: date_before:date');
    const { 0: date, 1: format } = attribute.split(",");
    if (value) {
        if (moment(value).isBefore(moment().add(-date, format))) {
            passes();
        } else {
            passes(false, `Your age must be above ${date} ${format}`);
        }
    }
});

Validator.registerAsync('validObjectId', function (value: any, attribute: any, req: Request, passes: any) {
    if (value) {
        if (mongoose.Types.ObjectId.isValid(value) && typeof value === 'string') {
            passes();
        } else {
            passes(false, 'Invalid ObjectId');
        }
    }
});
export default {
    validatorUtil,
    validatorUtilWithCallback
}