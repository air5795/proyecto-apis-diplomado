# Proyecto de Diplomado de ALEJANDRO IGLESIAS RALDES

## Descripción

Este es un proyecto de API REST desarrollado con Node.js y Express para el diplomado. Incluye funcionalidades de autenticación de usuarios, gestión de tareas y documentación con Swagger.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución de JavaScript.
- **Express**: Framework web para Node.js.
- **Sequelize**: ORM para bases de datos relacionales.
- **PostgreSQL**: Sistema de gestión de bases de datos.
- **JWT**: Para autenticación basada en tokens.
- **Bcrypt**: Para el hash de contraseñas.
- **Joi**: Para validación de datos.
- **Morgan**: Middleware para logging de solicitudes HTTP.
- **Pino**: Logger avanzado.
- **Swagger**: Para documentación de la API.

## Instalación

1. Clona el repositorio:
   ```
   git clone <url-del-repositorio>
   cd proyecto
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Configura las variables de entorno creando un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_DATABASE=nombre_de_la_base_de_datos
   DB_DIALECT=postgres
   BCRYPT_SALT_ROUNDS=10
   JWT_SECRET=tu_secreto_jwt
   JWT_EXPIRES_SECOND=3600
   DB_USE_SSL=false
   ```

4. Asegúrate de tener PostgreSQL instalado y ejecutándose, y crea la base de datos especificada.

## Uso

Para ejecutar el servidor en modo desarrollo (con recarga automática):
```
npm run start:dev
```

Para ejecutar el servidor en producción:
```
npm start
```

El servidor se ejecutará en `http://localhost:3000` por defecto.

## Documentación de la API

La documentación de la API está disponible en `http://localhost:3000/api-docs` gracias a Swagger.

### Endpoints Principales

#### Autenticación
- `POST /auth`: Iniciar sesión. Requiere email y contraseña.

#### Usuarios
- `POST /users`: Crear un nuevo usuario.
- `GET /users`: Obtener todos los usuarios.
- `GET /users/list/pagination`: Obtener usuarios con paginación.
- `GET /users/:id`: Obtener un usuario por ID (requiere autenticación).
- `PUT /users/:id`: Actualizar un usuario (requiere autenticación).
- `PATCH /users/:id`: Activar/desactivar un usuario (requiere autenticación).
- `DELETE /users/:id`: Eliminar un usuario (requiere autenticación).
- `GET /users/:id/tasks`: Obtener tareas de un usuario (requiere autenticación).

#### Tareas
- `POST /tasks`: Crear una nueva tarea (requiere autenticación).
- `GET /tasks`: Obtener todas las tareas (requiere autenticación).
- `GET /tasks/:id`: Obtener una tarea por ID (requiere autenticación).
- `PUT /tasks/:id`: Actualizar una tarea (requiere autenticación).
- `PATCH /tasks/:id`: Marcar tarea como completada (requiere autenticación).
- `DELETE /tasks/:id`: Eliminar una tarea (requiere autenticación).

Todos los endpoints protegidos requieren un token JWT en el header `Authorization: Bearer <token>`.

## Estructura del Proyecto

```
src/
├── app.js                 # Configuración principal de la aplicación
├── index.js               # Punto de entrada del servidor
├── common/
│   └── bcrypt.js          # Utilidades para hash de contraseñas
├── config/
│   └── env.js             # Configuración de variables de entorno
├── constants/
│   └── index.js           # Constantes del proyecto
├── controllers/
│   ├── auth.controller.js # Controlador de autenticación
│   ├── task.controller.js # Controlador de tareas
│   └── user.controller.js # Controlador de usuarios
├── database/
│   └── database.js        # Configuración de la base de datos
├── logs/
│   └── logger.js          # Configuración del logger
├── middlewares/
│   └── authenticate.middleware.js # Middleware de autenticación
├── models/
│   ├── index.js           # Asociación de modelos
│   ├── task.js            # Modelo de tarea
│   └── users.js           # Modelo de usuario
├── routes/
│   ├── auth.route.js      # Rutas de autenticación
│   ├── task.route.js      # Rutas de tareas
│   └── users.route.js     # Rutas de usuarios
└── validators/
    ├── task.validate.js   # Validaciones para tareas
    ├── user.validate.js   # Validaciones para usuarios
    └── validate.js        # Middleware de validación
```

