import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './utils/connect';
import { log } from './utils/logger';

// import error handlers

//   wrap your asynchronous code in try/catch blocks to handle potential errors
dotenv.config();
const app = express();

// middlewares

app.use(express.json());

app.use(
  cors({
    credentials: true,
  })
);
app.use(cookieParser());
app.use(compression());

app.get('/', (req: express.Request, res: express.Response) => {
  res.send(`<h1> Light Furniture </h1>`);
});

const server = http.createServer(app);
const port = process.env.PORT || 5000;

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
