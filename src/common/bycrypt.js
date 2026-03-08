import bcryptjs from 'bcryptjs';
import env from '../config/env.js';
import logger from '../logs/logger.js';

export const encriptar = async (text) => {
    try {
        const Rounds = Number(env.bcrypt_salt_rounds) || 10;
        const saltRounds = await bcryptjs.genSalt(Rounds);
        return await bcryptjs.hash(text, saltRounds);
    } catch (error) {
        logger.error(error);
        throw new Error('Error al encriptar')
    }
}

export const comparar = async (text, hash) => {
    try {
        return await bcryptjs.compare(text, hash);
    } catch (error) {
        logger.error(error);
        throw new Error('Error al comparar')
    }
}


