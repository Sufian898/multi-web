import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Serverless-friendly caching: reuse existing connection/promise if present
    const globalAny = globalThis;
    if (!globalAny.__MW_MONGO__) {
      globalAny.__MW_MONGO__ = { conn: null, promise: null };
    }

    if (globalAny.__MW_MONGO__.conn) {
      return globalAny.__MW_MONGO__.conn;
    }

    if (!globalAny.__MW_MONGO__.promise) {
      globalAny.__MW_MONGO__.promise = mongoose.connect(
        process.env.MONGODB_URI || 'mongodb+srv://1234saad:1234saad@cluster0.5ndemf8.mongodb.net/?appName=Cluster0',
        {
          // options not required in newer mongoose versions
        }
      );
    }

    const conn = await globalAny.__MW_MONGO__.promise;
    globalAny.__MW_MONGO__.conn = conn;

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    throw error;
  }
};

export default connectDB;

