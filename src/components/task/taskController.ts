import { NextFunction, Request, Response } from "express";
import commonUtils from "../../utils/commonUtils";
const Task = require("./taskModel");

async function addTask(req: Request, res: Response) {
    try {
        const { name, description, status } = req.body;
        const newTask = new Task({
            name,
            description,
            status: (status as string).toLowerCase(),
        });
        await newTask.save();
        return commonUtils.sendSuccess(req, res, newTask);
    } catch (err: any) {
        return commonUtils.sendError(req, res, { error: err.message });
    }
}
async function updateTask(req: Request, res: Response) {
    try {
        const taskId = req.params.id as string;
        const { name, description, status } = req.body;

        const task = await Task.findById(taskId);
        if (!task) throw new Error("Task not found with id");

        if (name) task.name = name;
        if (description) task.description = description;
        if (status) task.status = (status as string).toLowerCase();

        await task.save();
        return commonUtils.sendSuccess(req, res, task);
    } catch (err: any) {
        return commonUtils.sendError(req, res, { error: err.message });
    }
}

async function getTask(req: Request, res: Response) {
    try {
        const lastId = req.query.lastId as string;
        const search = req.query.search as string;

        let filter: any = undefined;

        if (search) {
            filter = {
                $or: [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }],
            };
        }

        if (lastId) {
            filter = {
                ...filter,
                // @ts-ignore
                _id: { $lt: new mongoose.Types.ObjectId(lastId) },
            };
        }
        const pipeline = [
            {
                $match: filter
                    ? {
                          $and: [filter],
                      }
                    : {},
            },
            { $sort: { updatedAt: -1 } },
            { $limit: 10 },
            {
                $group: {
                    _id: "$status",
                    tasks: { $push: "$$ROOT" },
                },
            },
        ];

        const taskList = await Task.aggregate(pipeline);
        if (taskList) {
            if (!taskList.find((a: any) => a?._id.toLowerCase() === "pending")) {
                taskList.push({
                    _id: "pending",
                    tasks: [],
                });
            }
            if (!taskList.find((a: any) => a?._id.toLowerCase() === "completed")) {
                taskList.push({
                    _id: "completed",
                    tasks: [],
                });
            }

            return commonUtils.sendSuccess(req, res, taskList);
        } else {
            return commonUtils.sendSuccess(req, res, [
                {
                    _id: "pending",
                    tasks: [],
                },
                {
                    _id: "completed",
                    tasks: [],
                },
            ]);
        }
    } catch (err: any) {
        return commonUtils.sendError(req, res, { error: err.message });
    }
}

async function deleteTask(req: Request, res: Response) {
    try {
        const taskId = req.params.id as string;
        await Task.deleteOne({ _id: taskId });
        return commonUtils.sendSuccess(req, res, { message: "task removed successfully" });
    } catch (err: any) {
        return commonUtils.sendError(req, res, { error: err.message });
    }
}
export default {
    addTask,
    updateTask,
    getTask,
    deleteTask,
};
