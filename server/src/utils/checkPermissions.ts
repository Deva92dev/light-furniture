import { CustomAPIError } from '../errors/custom-api';
import { UserType } from '../types';

export const checkPermissions = (
  requestUser: UserType,
  resourceUserId: object
) => {
  // console.log(requestUser);
  // console.log(resourceUserId);
  // console.log(typeof resourceUserId);
  if (requestUser.role === 'admin') return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new CustomAPIError('Not authorized to access this route ');
};
