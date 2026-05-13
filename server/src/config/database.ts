import mongoose from 'mongoose';
import env from './env';

const connectDatabase = async (): Promise<void> => {
  const conn = await mongoose.connect(env.MONGODB_URI, {
    maxPoolSize: 10,
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

export default connectDatabase;
