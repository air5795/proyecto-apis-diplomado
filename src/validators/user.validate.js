import Joi from "joi";
import { Status } from "../constants/index.js";

export const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
})

export const statusSchema = Joi.object({
    status: Joi.string().valid(...Object.values(Status)).required(),
})