import Joi from "joi";

export const schema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    done: Joi.boolean().optional(),
    // userId se toma del token, no se valida en el cuerpo
})

export const doneSchema = Joi.object({
    done: Joi.boolean().required(),
})