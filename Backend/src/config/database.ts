import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    // Explicitly binding to 127.0.0.1 over localhost to prevent Node IPv6 mapping resolution errors locally.
    const LOCAL_URI = 'mongodb://127.0.0.1:27017/cms_db';
    
    await mongoose.connect(LOCAL_URI);
    console.log(`[Database] Mongoose Connection Established Successfully on LOCAL HOST: ${LOCAL_URI}`);
  } catch (error) {
    console.error('[Database Ignition Error] Failed to connect to local MongoDB structure', error);
    process.exit(1);
  }
};
