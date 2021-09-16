// global imports
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from 'config';

// local imports
import User, { IUser } from '../models/userModel';
import AppError from '../utils/AppError';
import emailService from '../services/emailService';

interface TokenInterface {
  id: Types.ObjectId;
}

const signToken = (id: Types.ObjectId): string => {
  return jwt.sign({ id }, config.get<string>('jwtSecret'), {
    expiresIn: config.get<string>('jwtExpiresIn'),
  });
};

const createUniqueToken = async (len = 16) => {
  return await crypto
    .randomBytes(len / 2)
    .toString('hex')
    .slice(0, len);
};

export const onlyAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token)
    return next(new AppError('You are not authorized. Please log in', 401));

  // TODO promisify with TS
  jwt.verify(token, config.get<string>('jwtSecret'), function (err, decoded) {
    if (err) {
      return next(new AppError('You are not authorized!', 401));
    } else if ((decoded as TokenInterface) && (decoded as TokenInterface).id) {
      User.findById(
        (decoded as TokenInterface).id,
        function (err: Error, user: IUser) {
          if (err) {
            return next(
              new AppError('User with this token no longer exists!', 401),
            );
          } else if (user) {
            res.locals.userId = user._id;
            return next();
          } else {
            return new AppError('User with this token no longer exists!', 401);
          }
        },
      );
    } else {
      return new AppError('Something went wrong', 500);
    }
  });
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, email, password, passwordConfirm }: IUser = req.body;

  // check if all fields are submited
  if (!username || !email || !password || !passwordConfirm) {
    return next(new AppError('Please fill all required fields', 401));
  }

  // check if passsword match
  if (password !== passwordConfirm) {
    return next(new AppError('Password do not match', 401));
  }

  // check if user already exists
  try {
    const user: IUser | undefined = await User.findOne({ email: email });
    if (user) {
      return next(new AppError('User already exists', 409));
    }
  } catch (err: any) {
    next(new AppError(err.message, err.code));
  }

  try {
    const activationToken = await createUniqueToken();
    const user: IUser = await User.create({
      username,
      email,
      password,
      passwordConfirm,
      activationToken,
    });
    const token = signToken(user._id);

    // TO DO (what if email fails ???)
    await emailService.sendAccountActivation(email, activationToken);

    res.status(201).json({
      status: 'ok',
      message: 'User Created!',
    });
  } catch (err: any) {
    next(new AppError(err.message, 503));
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password }: IUser = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  try {
    const user: IUser | undefined = await User.findOne({ email }).select(
      '+password',
    );

    if (!user) {
      return next(new AppError('Incorrect email or password!', 401));
    }
    if (!(await user.passwordCheck(password))) {
      return next(new AppError('Incorrect email or password!', 401));
    }

    if (user.active === false) {
      return next(new AppError('Please activate your account!', 403));
    }

    const token = signToken(user._id);
    //TODO remove password from response
    res.status(200).json({
      status: 'OK',
      user: { username: user.username, email: user.email },
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const activateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.params.token;
  const user: IUser | undefined = await User.findOne({
    activationToken: token,
  });

  if (user) {
    user.active = true;
    user.activationToken = null;

    try {
      await user.save();
      return res
        .status(200)
        .json({ status: 'OK', message: 'User account acctivated!' });
    } catch (err) {
      next(new AppError('Something went wrong', 500));
    }
  }
  res.status(400).json({
    status: 'fail',
    message: 'Activation token does not exist!',
  });
};

// TODO better name for this one
export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next(new AppError('Token is not provided!', 401));

  jwt.verify(
    token,
    config.get<string>('jwtSecret'),
    function (err, decoded: any) {
      if (err) {
        return next(new AppError('Invalid token!', 401));
      } else if (decoded && decoded.id) {
        User.findById(decoded.id, function (err: Error, user: IUser) {
          if (err) {
            return next(
              new AppError('User with this token no longer exists!', 401),
            );
          } else if (user) {
            //TODO remove password from response
            res.status(200).json({
              status: 'OK',
              message: 'Token is valid!',
              user: { username: user.username, email: user.email },
              token,
            });
          } else {
            return next(
              new AppError('User with this token no longer exists!', 401),
            );
          }
        });
      }
    },
  );
};

export const sendResetPasswordToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide valid email!', 400));
  }

  const user: IUser = await User.findOne({ email });

  if (!user) {
    return res
      .status(200)
      .json({ status: 'OK', message: 'Password reset link sent!' });
  }
  try {
    const resetToken = await createUniqueToken();
    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

    await user.save();
    await emailService.sendPasswordReset(user.email, user.passwordResetToken);

    return res
      .status(200)
      .json({ status: 'OK', message: 'Password reset link sent!' });
  } catch (err) {
    return next(new AppError('Something went wrong', 503));
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { token } = req.params;

  try {
    const user: IUser | undefined = await User.findOne({
      passwordResetToken: token,
    });

    const { password, passwordConfirm } = req.body;

    if (
      !user ||
      !user.passwordResetToken ||
      !user.passwordResetTokenExpires ||
      !password ||
      !passwordConfirm
    ) {
      return next(new AppError('Request is not valid', 401));
    }

    if (Date.now() > user.passwordResetTokenExpires!) {
      return next(new AppError('Reset token expired', 401));
    }

    user.password = password;
    user.passwordChangedAt = Date.now();

    await user.save();

    return res.status(204).json({ status: 'OK', message: 'Password updated!' });
  } catch (err) {
    return next(new AppError('Something went wrong', 503));
  }
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) {
    return next(
      new AppError('Please provide valid password and password confirm!', 400),
    );
  }

  if (password !== passwordConfirm) {
    return next(
      new AppError('Password and password confrim do not match', 400),
    );
  }

  const userId = res.locals.userId as Types.ObjectId;

  try {
    const user: IUser | undefined = await User.findById(userId);

    if (!user) {
      return next(new AppError('That user no longer exist!', 401));
    }
    user.password = password;
    user.passwordChangedAt = Date.now();

    await user.save();
    return res.status(200).json({ status: 'OK', message: 'Password updated!' });
  } catch (err) {
    return next(new AppError('Something went wrong!', 500));
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = res.locals.userId;

  const { username } = req.body;

  if (!username) {
    return next(new AppError('Plese provide username', 400));
  }

  try {
    const user: IUser | undefined = await User.findById(userId);

    if (!user) {
      return next(new AppError('That user no longer exist!', 401));
    }

    user.username = username;
    await user.save();
    return res.status(200).json({
      status: 'OK',
      message: 'User updated',
      user: { username: user.username, email: user.email },
    });
  } catch {
    return next(new AppError('Something went wrong', 500));
  }
};
