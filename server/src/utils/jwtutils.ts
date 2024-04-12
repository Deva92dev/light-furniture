import { Response } from 'express';
import jwt from 'jsonwebtoken';

export interface jwtPayload {
  name: string;
  userId: string;
  role: string;
}

// payload is the only thing that will be passed on from controller
export const createJWT = ({ payload }: { payload: jwtPayload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

export const isTokenValid = ({ token }: { token: string }) => {
  try {
    // Verify the token and handle potential errors
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwtPayload;
    return decoded; // Return the decoded payload on success
  } catch (error) {
    // Handle specific error types or provide a generic message
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token format');
    } else {
      throw new Error('Authentication failed'); // Generic error for other cases
    }
  }
};

// here, res from authController, user is tokenUser
export const attachCookiesToResponse = (res: Response, user: jwtPayload) => {
  const token = createJWT({ payload: user });

  const oneDay = 1000 * 60 * 60 * 24; // number off milliseconds
  // storing jwt in cookies so that it can be accessed by only server
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production', // secured over https
    signed: true,
  });
};
