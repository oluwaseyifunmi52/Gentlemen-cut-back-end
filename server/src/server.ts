import env from './config/env';
import { connectDatabase } from './config/database';
import app from './app';
import mongoose from 'mongoose';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const port = env.port || 5000;

async function startServer() {
  try {
    await connectDatabase();
    
    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📍 Environment: ${env.nodeEnv}`);
      console.log(`🌐 Shop timezone: ${env.shopTimezone}`);
      console.log(`🔗 Client URL: ${env.clientUrl}`);
    });

    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received. Shutting down gracefully...');
      await shutdown(server);
    });

    process.on('SIGINT', async () => {
      console.log('🛑 SIGINT received. Shutting down gracefully...');
      await shutdown(server);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

const shutdown = async (server: any) => {
  server.close();
  await mongoose.connection.close();
  console.log('👋 Shutdown complete');
};

startServer();