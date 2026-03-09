import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import usersRoutes from './routes/users.route.js'
import authRoutes from './routes/auth.route.js'
import taskRoutes from './routes/task.route.js'

const app = express();

// Trust reverse proxy (Render, Heroku, etc.) so req.protocol returns 'https' correctly
app.set('trust proxy', 1);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Diplomado',
      version: '1.0.0',
      description: 'Documentación de la API para el proyecto de diplomado',
    },
    servers: [
      {
        url: '/',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middlewares
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Swagger route - server URL is resolved dynamically from the request
app.use('/api-docs', swaggerUi.serve, (req, res, next) => {
  const serverUrl = `${req.protocol}://${req.get('host')}`;
  const dynamicSpec = {
    ...swaggerSpec,
    servers: [{ url: serverUrl, description: 'API Server' }],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Portada
app.get('/', (req, res) => {
  const swaggerUrl = `${req.protocol}://${req.get('host')}/api-docs`;
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Proyecto Diplomado</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 48px 56px;
      max-width: 560px;
      width: 90%;
      text-align: center;
      box-shadow: 0 25px 60px rgba(0,0,0,0.4);
    }
    .badge {
      display: inline-block;
      background: #0ea5e9;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 4px 14px;
      border-radius: 999px;
      margin-bottom: 28px;
    }
    h1 {
      font-size: 26px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 8px;
    }
    .ci {
      font-size: 14px;
      color: #94a3b8;
      margin-bottom: 32px;
    }
    .divider {
      border: none;
      border-top: 1px solid #334155;
      margin: 0 auto 28px;
      width: 60%;
    }
    .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 6px;
    }
    .project {
      font-size: 17px;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 24px;
    }
    .diplomado {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 36px;
    }
    a.btn {
      display: inline-block;
      background: #0ea5e9;
      color: #fff;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      transition: background 0.2s;
    }
    a.btn:hover { background: #0284c7; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Proyecto API</span>
    <h1>Alejandro Iglesias Raldes</h1>
    <p class="ci">CI: 10478330</p>
    <hr class="divider"/>
    <p class="label">Modulo</p>
    <p class="project">MODULO IV - DESARROLLO BACKEND CON NODE.JS Y EXPRESS</p>
    <p class="label">Diplomado</p>
    <p class="diplomado">DIPLOMADO EN FULLSTACK DEVELOPER BACK END Y FRONT END V8</p>
    <a class="btn" href="${swaggerUrl}" target="_blank">Ver documentacion Swagger</a>
  </div>
</body>
</html>`);
});

// Routes
app.use('/api/users', usersRoutes);
app.use('/api/login', authRoutes);
app.use('/api/tasks', taskRoutes);



export default app;
