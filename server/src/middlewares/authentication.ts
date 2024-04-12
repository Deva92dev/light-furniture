import { NextFunction, Response } from 'express';
import { isTokenValid } from '../utils/jwtutils';
import { StatusCodes } from 'http-status-codes';
import { UserRequest } from '../types';
import { CustomAPIError } from 'errors/custom-api';

// signed cookies always be in req.signedCookies
export const authenticateUser = async (
  req: UserRequest, // here we are adding one more property which also extends Request
  res: Response,
  next: NextFunction
) => {
  const token: string = req.signedCookies.token; // name of our cookie is token
  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'invalid token' });
  }
  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };
    next();
  } catch (error) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: 'Authentication Invalid' });
  }
};

export const authorizePermission = (...roles: string[]) => {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: 'Unauthorized to access this route' });
    }
    next();
  };
};
