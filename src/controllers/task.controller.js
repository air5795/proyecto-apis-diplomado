import { Task } from "../models/task.js";
import { User } from "../models/users.js";
import logger from "../logs/logger.js";

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Crear una nueva tarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Comprar leche"
 *               done:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Tarea creada
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error al crear tarea
 */
async function createTask(req, res) {
  const { name } = req.body;
  const userId = req.user?.id;

  logger.debug('createTask body:', req.body, 'userId:', userId);

  if (!userId) {
    return res.status(400).json({ msg: 'Falta identificador de usuario (token inválido)' });
  }

  if (!name) {
    return res.status(400).json({
      msg: "No existe la tarea",
    });
  }

  try {
    const newtask = await Task.create({
      name,
      user_id: userId,
    });
    return res.json(newtask);
  } catch (error) {
    logger.error('createTask error', error);
    // enviar mensaje de error real al cliente para facilitar debugging
    return res.status(500).json({
      msg: "Error al crear tarea",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Obtener tareas del usuario autenticado
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tareas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       done:
 *                         type: boolean
 */
async function get(req, res) {
    const userId = req.user.id;
  try {
    const tasks = await Task.findAndCountAll({
      attributes: ['id', 'name', 'done'],
      order: [['id', 'DESC']],
      where: {
        user_id: userId
      },
      include: [User],
    })
    res.json({
      total: tasks.count,
      data: tasks.rows,
    })
  } catch (error) {
    logger.error(error);
    return res.json(error);
  }
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obtener una tarea por ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Tarea encontrada
 *       404:
 *         description: Tarea no encontrada
 */
async function findById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

  try {
    const task = await Task.findOne({
      attributes: ['name', 'done'],
      where: {
        id,
        user_id: userId
      },
      include: [User],
    });
    if (!task) {
      return res.status(404).json({
        msg: "Tarea no encontrada",
      });
    }
    res.json(task);
  } catch (error) {
    logger.error(error);
    return res.json(error);
  }
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Actualizar una tarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               done:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tarea actualizada
 *       404:
 *         description: Tarea no encontrada
 */
async function update(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({
      msg: "No existe la tarea",
    });
  }

  try {
    const task = await Task.update({
      name
    }, {
      where: {
        id,
        user_id: userId
      },
    });
    if (!task[0]) {
      return res.status(404).json({
        msg: "Tarea no encontrada",
      });
    }
    res.json(task);
  } catch (error) {
    logger.error(error);
    return res.json(error);
  }
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     summary: Marcar tarea como completada o pendiente
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - done
 *             properties:
 *               done:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estado de la tarea actualizado
 *       400:
 *         description: Estado inválido
 *       404:
 *         description: Tarea no encontrada
 */
const done = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { done } = req.body;

  if (done === undefined) return res.status(400).json({ msg: "Debe especificar el estado done" });

  if (typeof done !== 'boolean') {
    return res.status(400).json({
      msg: "Done debe ser true o false"
    });
  }

  try {
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ msg: "Tarea no encontrada" });
    }

    if (task.done === done) {
      return res.status(409).json({ msg: `La tarea ya se encuentra en done: ${done}` });
    }

    task.done = done;
    await task.save();

    res.json(task);
  } catch (error) {
    logger.error("Error en activateInactivate:", error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Eliminar una tarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Tarea eliminada
 *       404:
 *         description: Tarea no encontrada
 */
async function remove(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const task = await Task.destroy({
      where: {
        id,
        user_id: userId
      },
    });
    if (!task) {
      return res.status(404).json({
        msg: "Tarea no encontrada",
      });
    }
    res.json(task);
  } catch (error) {
    logger.error(error);
    return res.json(error);
  }
}

export default {
  createTask,
  get,
  findById,
  update,
  remove,
  done,
}
