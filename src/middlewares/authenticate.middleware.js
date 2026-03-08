import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export function authenticate(req, res, next) {
    // obtener el token de la cabecera de autorización
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader); // Debug: Verificar el valor del header
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    console.log('Extracted Token:', token); // Debug: Verificar el token extraído

    if (token == null) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // verificamos y decodificamos el token
    jwt.verify(token, env.jwt_secret, (err, user) => {
        console.log('JWT Verification Error:', err); // Debug: Verificar si hay un error en la verificación
        console.log('Decoded User:', user); // Debug: Verificar el contenido decodificado del token
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }
        req.user = user;
        next();
    });

}
