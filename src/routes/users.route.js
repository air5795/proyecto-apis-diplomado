import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import validate from '../validators/validate.js';
import { schema, statusSchema } from '../validators/user.validate.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
const router = Router();

router.route('/')
    .post(validate(schema), userController.createUser)
    .get(userController.get)

router.route('/list/pagination')
    .get(userController.getUsersPaginated)

router.route('/:id')
    .get(authenticate,userController.findById)
    .put(authenticate, validate(schema), userController.update)
    .patch(authenticate, userController.activateInactivate)
    .delete(authenticate, userController.remove)

router.route('/:id/tasks')
    .get(authenticate, userController.getUserTasks)

export default router