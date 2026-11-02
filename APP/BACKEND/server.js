import express from "express"
import dotenv from "dotenv" 
import cors from "cors"
dotenv.config();

const PORT = process.env.PORT || 5601;


const app = express();

//cors configaration for storefront(5173) and admin(5174)
const allowOrigins = process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : ['http://localhost:5173,http://localhost:5174'];
console.log(allowOrigins);

app.use(
    cors({
        origin:(origin, callback) =>{
            if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
        },
        credentials:true
    })
)
app.use(express.json())
// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`)
})
