import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

//import database
import './db/mongoose';

// local imports
import AppError from './utils/AppError';
import errorHandler from './controllers/errorControler';

const app = express();

// middlewares
app.use(cors());
app.use(bodyParser.json());

// routers
import userRouter from './routes/userRoutes';
import unitRouter from './routes/unitRoutes';
import reservationRouter from './routes/reservationRoutes';

// routes
app.use('/api/v1', userRouter);
app.use('/api/v1/units', unitRouter);
app.use('/api/v1/reservations', reservationRouter);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cant find ${req.originalUrl}`, 404));
});

// error handler
app.use(errorHandler);

export default app;
