import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` AccessBridge Backend Server Running!`);
  console.log(` Port: ${PORT}`);
  console.log(` Environment: ${env.NODE_ENV}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` Auth endpoints: /api/auth/register, /api/auth/login`);
  console.log(`=======================================================`);
});

// Connect to MongoDB asynchronously without delaying server availability
connectDB().catch((err) => {
  console.warn(`[Database] Initial connection attempt: ${err.message}`);
});

export default server;
