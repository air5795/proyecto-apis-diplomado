import { User } from './users.js';
import { Task } from './task.js';

// Definir asociaciones
Task.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Task, { foreignKey: 'user_id' });

export { User, Task };
