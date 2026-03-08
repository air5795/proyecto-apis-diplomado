import { comparar } from "../common/bycrypt.js";
import logger from "../logs/logger.js";
import { User } from "../models/users.js";
import env from "../config/env.js";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
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
 *         description: Token de autenticación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       403:
 *         description: Credenciales inválidas
 *       404:
 *         description: Usuario no encontrado
 */
async function login(req, res) {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({
            where: { username },
        });

        if (!user)
            return res.status(404).json({ message: 'usuario no encontrado' });

        if (!(await comparar(password, user.password)))
            return res.status(403).json({ message: 'usuario no autorizado' });

        const token = jwt.sign({ id: user.id }, env.jwt_secret, {
            expiresIn: Number(env.jwt_expires_second),
        });

        return res.json({ token });

    } catch (error) {
        logger.error(error);
        return res.json(error.message);
    }

}


export default {
    login,
}