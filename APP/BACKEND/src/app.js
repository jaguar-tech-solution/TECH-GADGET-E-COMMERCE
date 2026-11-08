import express from 'express';
import cors from 'cors';
import helmet from "helmet";
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import authRoutes from "./routers/authRoutes.js"
import { errorHandler } from "./middleware/errorHandler.js"



const app = express();

// Configure CORS allowed origins
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(helmet())//configure http security headers
app.set("trust proxy", 1);//set to real prox hop
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
app.use(express.json({limit: "15kb"}));
app.use(cookieParser())


// GET /api/v1/health
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
app.use(
  rateLimit({
    windowMs:15 * 60 * 1000,
    limit:300,
    standardHeaders:true,
    legacyHeaders:true,
  })
)

//POST /api/v1/auth
app.use("/api/v1/auth", authRoutes);

app.use((req, res, next) => {
  const error = new Error("The requested resource does not exist.");
  error.statusCode = 404;
  error.code = "RESOURCE_NOT_FOUND";
  next(error);
});

app.use(errorHandler)


export default app;