import mongoose from 'mongoose';

export async function connectDatabase() {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    console.error('❌ MONGODB_URI environment variable is not defined');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    const err = error as any;
    console.error('❌ MongoDB connection failed:');
    console.error(`  error code: ${err.code}`);
    console.error(`  error name: ${err.name}`);
    console.error(`  error message: ${err.message}`);
    console.error(`  MONGODB_URI exists: ${!!process.env.MONGODB_URI}`);
    process.exit(1);
  }
}

// Graceful connection disconnection
export async function disconnectDatabase() {
  await mongoose.connection.close();
  console.log('👋 MongoDB connection closed');
}