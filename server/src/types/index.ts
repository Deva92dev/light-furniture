import { Request } from 'express';

export interface UserType {
  name: string;
  userId: string;
  role: string;
}

export interface UserRequest extends Request {
  user?: UserType;
}
