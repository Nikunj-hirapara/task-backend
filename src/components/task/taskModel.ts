import mongoose, { ObjectId } from "mongoose";
import { AppConstants } from "../../utils/appConstants";


const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model(AppConstants.MODEL_TASK, taskSchema);