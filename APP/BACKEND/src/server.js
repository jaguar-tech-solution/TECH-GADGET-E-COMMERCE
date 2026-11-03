import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3780;

app.listen(PORT, () => {
  console.log(`🚀 Backend API listening on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/v1/health`);
});