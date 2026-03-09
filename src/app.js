import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import usersRoutes from './routes/users.route.js'
import authRoutes from './routes/auth.route.js'
import taskRoutes from './routes/task.route.js'

const app = express();

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

// Routes
app.use('/api/users', usersRoutes);
app.use('/api/login', authRoutes);
app.use('/api/tasks', taskRoutes);



export default app;
