import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserRequest } from '../types/index';
import { User } from '../models/userModel';
import { createUserToken } from '../utils/createTokenUser';
import { attachCookiesToResponse } from '../utils/jwtutils';
import { checkPermissions } from '../utils/checkPermissions';

export const getAllUsers = async (req: UserRequest, res: Response) => {
  console.log(req.user);
  const users = await User.find({ role: 'user' }).select('-password');
  res.status(StatusCodes.OK).json({ users });
};

// for the single users, id is in the params
export const getSingleUser = async (req: UserRequest, res: Response) => {
  const user = await User.findOne({ _id: req.params.id }).select('-password');
  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send(`No user with such id : ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

export const showCurrentUser = async (req: UserRequest, res: Response) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

// update user with user.save()
export const updateUser = async (req: UserRequest, res: Response) => {
  const { name, email } = req.body;
  if (!name || !email) {
    res.status(StatusCodes.BAD_REQUEST).send('Provide Name And Email');
  }
  const user = await User.findOne({ _id: req.user.userId });

  // update the properties
  user.email = email;
  user.name = name;

  // If u are using save(), it means you are invoking one more time, leading to change hashed password change one more time
  await user.save();

  const tokenUser = createUserToken(user);
  attachCookiesToResponse(res, tokenUser);
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

export const updateUserPassword = async (req: UserRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    res.status(StatusCodes.BAD_REQUEST).send('Please provide both values');
  }
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    res.status(StatusCodes.UNAUTHORIZED).send('Invalid Credentials');
  }
  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated' });
};

// update user with findOneAndUpdate
// export const updateUser = async (req: UserRequest, res: Response) => {
//   const { name, email } = req.body;
//   if (!name || !email) {
//     res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Provide Name And Email' });
//   }
//   const user = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     { email, name },
//     { new: true, runValidators: true }
//   );

//   const tokenUser = createUserToken(user);
//   attachCookiesToResponse(res, tokenUser);
//   res.status(StatusCodes.OK).json({ user: tokenUser });
// };
