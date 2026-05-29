import express, { Application } from 'express';
import { register } from 'prom-client';
import { metricsMiddleware } from './middlewares/metricsMiddleware';
import { errorHandler } from './middlewares/errorHandler';
import userRoutes from './routes/userRoutes';
import nutritionRoutes from './routes/nutritionRoutes';
import journalRoutes from './routes/journalRoutes';
import weightRoutes from './routes/weightRoutes';
import healthRoutes from './routes/healthRoutes';

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(metricsMiddleware);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/weight', weightRoutes);
app.use('/health', healthRoutes);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Error handling
app.use(errorHandler);

export default app;
