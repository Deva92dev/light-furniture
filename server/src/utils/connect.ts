import mongoose from 'mongoose';
import { log } from './logger';
import config from 'config';

export const connectDB = async () => {
  const MONGO_URL = config.get<string>('MONGO_URL');
  try {
    mongoose.connect(MONGO_URL);
    const connection = mongoose.connection;

    connection.on('connected', () => {
      log.info('MongoDB is connected successfully');
    });
    connection.on('error', (err: Error) => {
      log.error(
        'Something goes wrong. Please make sure that MongoDB is running' + err
      );
      process.exit();
    });
  } catch (error) {
    log.info('Something goes wrong');
    log.error(error);
  }
};
