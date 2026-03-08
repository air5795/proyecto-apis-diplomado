import { Router } from 'express';
import taskController from '../controllers/task.controller.js';
import validate from '../validators/validate.js';
import { schema, doneSchema } from '../validators/task.validate.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';

const router = Router();

router.route('/')
    .post(authenticate, validate(schema), taskController.createTask)
    .get(authenticate, taskController.get)

router.route('/:id')
    .get(authenticate, taskController.findById)
    .put(authenticate, validate(schema), taskController.update)
    .patch(authenticate, validate(doneSchema), taskController.done)
    .delete(authenticate, taskController.remove)

export default router