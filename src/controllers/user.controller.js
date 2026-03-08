import { Op } from 'sequelize';
import { User } from "../models/users.js";
import { Task } from "../models/task.js";
import logger from "../logs/logger.js";
import { Status } from "../constants/index.js";
import { encriptar } from "../common/bycrypt.js";

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "usuario123"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Usuario creado
 *       500:
 *         description: Error al crear usuario
 */
async function createUser(req, res) {
  const { username, password } = req.body;

  try {
    const user = await User.create({
      username,
      password,
    });
    res.json(user);
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      msg: "Error al crear usuario",
    });
  }
}

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios activos
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
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
 *                       username:
 *                         type: string
 *                       status:
 *                         type: string
 */
async function get(_req, res) {
  try {
    const users = await User.findAndCountAll({
      attributes: ['id', 'username', 'status'],
      order: [['id', 'DESC']],
      where: {
        status: Status.ACTIVE,
      },
      include: [Task],
    })
    res.json({
      total: users.count,
      data: users.rows,
    })
  } catch (error) {
    logger.error(error);
    return res.json(error);
  }
}

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
async function findById(_req, res) {
  try {
    const user = await User.findOne({
      attributes: ['id', 'username', 'status'],
      where: {
        id: _req.params.id,
      },
      include: [Task],
    });
    if (!user) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }
    res.json(user);
  } catch (error) {
    logger.error(error);
    return res.json(error);
  }
}

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 */
async function update(_req, res) {
  const { id } = _req.params;
  const { username, password } = _req.body;
  const passwordEncriptada = await encriptar(password);

  try {
    const user = await User.update({
      username,
      password: passwordEncriptada,
    }, {
      where: {
        id: id,
      },
    });
    if (!user) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }
    res.json(user);
  } catch (error) {
    logger.error(error);
    return res.json(error);
  }
}

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Activar o inactivar un usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Estado del usuario actualizado
 *       400:
 *         description: Estado inválido
 *       404:
 *         description: Usuario no encontrado
 */
const activateInactivate = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ msg: "Debe especificar un estado" });

  if (!Object.values(Status).includes(status)) {
    return res.status(400).json({
      msg: `El estado es inválido. Valores permitidos: ${Object.values(Status).join(', ')}`
    });
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    if (user.status === status) {
      return res.status(409).json({ msg: `El usuario ya se encuentra en ${status}` });
    }

    user.status = status;
    await user.save();

    res.json(user);
  } catch (error) {
    logger.error("Error en activateInactivate:", error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
}

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 */
async function remove(_req, res) {
  const { id } = _req.params;
  try {
    const user = await User.destroy({
      where: {
        id: id,
      },
    });
    if (!user) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }
    res.json(user);
  } catch (error) {
    logger.error(error);
    return res.json(error);
  }
}

/**
 * @swagger
 * /api/users/{id}/tasks:
 *   get:
 *     summary: Obtener tareas de un usuario (INNER JOIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de tareas del usuario
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
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           username:
 *                             type: string
 */
async function getUserTasks(req, res) {
  const { id } = req.params;
  try {
    const tasks = await Task.findAll({
      where: {
        user_id: id,
      },
      include: [{
        model: User,
        required: true, // Esto hace INNER JOIN
        attributes: ['id', 'username'], // Solo campos necesarios
      }],
      order: [['id', 'DESC']],
    });
    res.json({
      total: tasks.length,
      data: tasks,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      msg: "Error al obtener tareas del usuario",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /api/users/list/pagination:
 *   get:
 *     summary: Obtener usuarios con paginación, búsqueda y ordenamiento
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de la página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           enum: [5, 10, 15, 20]
 *         description: Cantidad de registros a mostrar
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda de username que contengan la palabra (ILIKE)
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           default: id
 *           enum: [id, username, status]
 *         description: Valor por ordenar
 *       - in: query
 *         name: orderDir
 *         schema:
 *           type: string
 *           default: DESC
 *           enum: [ASC, DESC]
 *         description: Dirección por ordenar
 *     responses:
 *       200:
 *         description: Lista paginada de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 20
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 pages:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       status:
 *                         type: string
 */
async function getUsersPaginated(req, res) {
  const { page = 1, limit = 10, search, orderBy = 'id', orderDir = 'DESC' } = req.query;

  // Validaciones
  const validLimits = [5, 10, 15, 20];
  if (!validLimits.includes(parseInt(limit))) {
    return res.status(400).json({ msg: 'Limit debe ser 5, 10, 15 o 20' });
  }

  const validOrderBy = ['id', 'username', 'status'];
  if (!validOrderBy.includes(orderBy)) {
    return res.status(400).json({ msg: 'orderBy debe ser id, username o status' });
  }

  const validOrderDir = ['ASC', 'DESC'];
  if (!validOrderDir.includes(orderDir.toUpperCase())) {
    return res.status(400).json({ msg: 'orderDir debe ser ASC o DESC' });
  }

  try {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (search) {
      where.username = { [Op.iLike]: `%${search}%` };
    }

    const users = await User.findAndCountAll({
      attributes: ['id', 'username', 'status'],
      where,
      order: [[orderBy, orderDir.toUpperCase()]],
      limit: parseInt(limit),
      offset,
    });

    const totalPages = Math.ceil(users.count / parseInt(limit));

    res.json({
      total: users.count,
      page: parseInt(page),
      pages: totalPages,
      data: users.rows,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ msg: 'Error al obtener usuarios' });
  }
}

export default {
  createUser,
  get,
  findById,
  update,
  remove,
  activateInactivate,
  getUserTasks,
  getUsersPaginated,
};