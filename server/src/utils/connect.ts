import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URL);
    const connection = mongoose.connection;

    connection.on('connected', () => {
      console.log('MongoDB is connected successfully');
    });
    connection.on('error', (err: Error) => {
      console.log(
        'Something goes wrong. Please make sure that MongoDB is running' + err
      );
      process.exit();
    });
  } catch (error) {
    console.log('Something goes wrong');
    console.log(error);
  }
};
