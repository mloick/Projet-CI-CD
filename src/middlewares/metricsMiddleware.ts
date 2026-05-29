import { Request, Response, NextFunction } from 'express';
import { Counter, Histogram, Gauge } from 'prom-client';

// Métriques
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const httpRequestsInFlight = new Gauge({
  name: 'http_requests_in_flight',
  help: 'Number of HTTP requests currently being processed',
});

export const appErrorsTotal = new Counter({
  name: 'app_errors_total',
  help: 'Total number of application errors',
  labelNames: ['type'],
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = process.hrtime();

  // Incrémenter les requêtes en cours
  httpRequestsInFlight.inc();

  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    const route = req.route ? req.route.path : req.path;
    const statusCode = res.statusCode.toString();

    // Enregistrer les métriques de fin de requête
    httpRequestsTotal.labels(req.method, route, statusCode).inc();
    httpRequestDurationSeconds.labels(req.method, route, statusCode).observe(durationInSeconds);

    // Décrémenter les requêtes en cours
    httpRequestsInFlight.dec();

    // Suivi des erreurs par type
    if (res.statusCode >= 500) {
      appErrorsTotal.labels('internal').inc();
    } else if (res.statusCode === 404) {
      appErrorsTotal.labels('not_found').inc();
    } else if (res.statusCode === 400) {
      appErrorsTotal.labels('validation').inc();
    }
  });

  next();
};
