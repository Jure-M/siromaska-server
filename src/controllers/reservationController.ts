import { Request, Response, NextFunction } from 'express';
import Reservation, { IReservation } from '../models/reservationModel';
import AppError from '../utils/AppError';

export const createReservation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { unit, dateFrom, dateTo, guestName, numberOfGuests, price, agency } =
    req.body;

  if (!unit) {
    return next(new AppError('Something went wrong', 500));
  }
  if (
    !dateFrom ||
    !dateTo ||
    !guestName ||
    !numberOfGuests ||
    !price ||
    !agency
  ) {
    return next(new AppError('Please fill all required fields', 400));
  }

  if (new Date(dateTo).getTime() < new Date(dateFrom).getTime()) {
    return next(new AppError('Reservation can not end before it started', 400));
  }

  try {
    const reservations: IReservation[] = await Reservation.find({ unit });

    const isOvelaping = reservations.some(
      (reservation) =>
        reservation.dateTo.getTime() > new Date(dateFrom).getTime() ||
        reservation.dateFrom.getTime() < new Date(dateTo).getTime(),
    );

    if (isOvelaping) {
      return next(new AppError('Existing reservation is overlaping!', 403));
    }
  } catch (err) {
    console.log(err);
  }

  return res.status(200).json({ status: 'OK' });
};

export const getReservation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(200).json({ status: 'ok' });
};

export const updateReservation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(200);
};

export const deleteReservation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(200);
};

export const getAllReservations = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(200);
};
