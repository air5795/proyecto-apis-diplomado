import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Status } from "../constants/index.js";
import { encriptar } from "../common/bycrypt.js";

export const User = sequelize.define("users", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: "Ingrese username",
            },
            notEmpty: {
                msg: "Ingrese username",
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: "Ingrese password",
            },
            notEmpty: {
                msg: "Ingrese password",
            }
        }
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: Status.ACTIVE,
        validate: {
            isIn: {
                args: [[Status.ACTIVE, Status.INACTIVE]],
                msg: `debe ser ${Status.ACTIVE} O ${Status.INACTIVE} `,
            }
        }
    },
});

// User.hasMany(Task);
// Task.belongsTo(User);

User.beforeCreate(async (user) => {
    user.password = await encriptar(user.password);
})