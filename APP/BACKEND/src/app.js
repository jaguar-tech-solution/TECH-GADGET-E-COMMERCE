import express from 'express';
import cors from 'cors';

const app = express();

// Configure CORS allowed origins
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

// Body parser middleware to handle incoming JSON payloads
app.use(express.json());

// GET /api/v1/health
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default app;