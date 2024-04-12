import { Request, Response } from 'express';
import { User } from '../models/userModel';
import { StatusCodes } from 'http-status-codes';
import { attachCookiesToResponse } from '../utils/jwtutils';
import { createUserToken } from '../utils/createTokenUser';

export const register = async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    res.status(StatusCodes.BAD_REQUEST).send('Email already exists');
  }

  // first registered user is admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';
  const user = await User.create({ email, name, password, role });

  // once user is created, secure them with jwt, payload means data(send or receive)
  const tokenUser = createUserToken(user);
  attachCookiesToResponse(res, tokenUser);
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send('provide email or password');
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).send('There is no such user');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return res.status(StatusCodes.UNAUTHORIZED).send('Invalid credentials');
  }

  const tokenUser = createUserToken(user);
  attachCookiesToResponse(res, tokenUser);
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

export const logout = async (req: Request, res: Response) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'User logged out!' });
};
