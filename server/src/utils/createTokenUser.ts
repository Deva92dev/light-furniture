import { IUser } from '../models/userModel';

export const createUserToken = (user: IUser) => {
  return { name: user.name, userId: user._id as string, role: user.role };
};
