import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import Unit, { IUnit } from '../models/unitModel';
import AppError from '../utils/AppError';

const isNameValid = (name: string | undefined): boolean => {
  if (!name || name.length < 3) {
    return false;
  }
  return true;
};

// create unit
export const createUnit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const name: string = req.body.name;

  if (!isNameValid(name))
    return next(new AppError('Please provide valid unit name!', 400));

  try {
    const newUnit: IUnit = await new Unit({
      name,
      user: res.locals.userId,
    }).save();
    return res
      .status(201)
      .json({ status: 'OK', message: 'Unit created!', unit: newUnit });
  } catch {
    return next(new AppError('Something went wrong', 500));
  }
};

// get all units
export const getAllUnits = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const units: IUnit = await Unit.find({}).where({
      user: res.locals.userId,
    });

    res.status(200).json({ status: 'ok', units });
  } catch {
    return next(new AppError('Something went wrong', 503));
  }
};

// get single unit
export const getUnit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUnit: IUnit = await Unit.findById(req.params.id);

    if (!currentUnit) {
      return next(new AppError('Unit does not exist', 400));
    }

    if (currentUnit.user.toString() !== res.locals.userId.toString()) {
      return next(new AppError('You are not authorized', 403));
    }

    return res.status(200).json({
      status: 'ok',
      unit: { id: currentUnit._id, name: currentUnit.name },
    });
  } catch {
    return next(new AppError('Something went wrong', 500));
  }
};

// delete unit
export const deleteUnit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUnit: IUnit = await Unit.findById(req.params.id);

    if (!currentUnit) {
      return next(new AppError('Unit does not exist', 400));
    }

    if (currentUnit.user.toString() !== res.locals.userId.toString()) {
      return next(new AppError('You are not authorized', 403));
    }

    await Unit.findByIdAndDelete(req.params.id);
    return res.status(200).json({ status: 'OK', message: 'Unit deleted!' });
  } catch {
    return next(new AppError('Something went wrong', 500));
  }
};

// update unit
export const updateUnit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const newName: string | undefined = req.body.name;

  if (!isNameValid(newName))
    return next(new AppError('Please provide valid unit id!', 400));

  try {
    const currentUnit: IUnit = await Unit.findById(req.params.id);

    if (!currentUnit) {
      return next(new AppError('Unit does not exist', 400));
    }

    if (currentUnit.user.toString() !== res.locals.userId.toString()) {
      return next(new AppError('You are not authorized to make change!', 403));
    }

    currentUnit.name = newName!;

    await currentUnit.save();
    return res.status(200).json({
      status: 'OK',
      message: 'Unit updated!',
      unit: { id: currentUnit._id, name: currentUnit.name },
    });
  } catch {
    return next(new AppError('Something went wrong', 500));
  }
};
