import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import 'express-async-errors'; // it applies tryCatch block to all our controllers
import fileUpload from 'express-fileupload';
import rateLimiter from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

import { connectDB } from './utils/connect';
import { log } from './utils/logger';
import config from 'config';

// routes
import authRouter from './routes/authRoutes';
import userRouter from './routes/userRoutes';
import productRouter from './routes/productRoutes';
import reviewRouter from './routes/reviewRoutes';
import orderRouter from './routes/orderRoutes';

// middlewares
import { errorHandlerMiddleware } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

dotenv.config();
const app = express();

app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 60 * 60 * 1000, // change back to 15 minutes
    max: 60,
  })
);
app.use(helmet());
// For production, specify allowed origins:
// app.use(cors({ origin: ['http://localhost:3000'] }));
app.use(mongoSanitize());

app.use(morgan('tiny')); // remove it before production
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET)); // so that we get cookie from browser and don't need to have it from frontend,cause after 1st request, all the work done by server AND ALSO SIGNING IT BY GIVING ARGUMENT

app.use(express.static('./public'));
app.use(fileUpload());

app.use(compression());

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Light Furniture');
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);

app.use(notFound); // This is for the routes we didn't set.
app.use(errorHandlerMiddleware); //This will hit only with existing routes throw an error

const server = http.createServer(app);
const port = config.get<number>('port');

const start = async () => {
  try {
    await connectDB();
    server.listen(port, () => {
      log.info(`Server is listening on the port : ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
