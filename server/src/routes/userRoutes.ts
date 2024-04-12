import {
  authenticateUser,
  authorizePermission,
} from '../middlewares/authentication';
import {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} from '../controllers/userController';
import express, { Router } from 'express';

const router: Router = express.Router();
// first authenticate the user and then check for admin, can add more roles in authorizePermission
router
  .route('/')
  .get(authenticateUser, authorizePermission('admin'), getAllUsers);
router.route('/showMe').get(authenticateUser, showCurrentUser);
router.route('/updateUser').patch(authenticateUser, updateUser);
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword);
router.route('/:id').get(authenticateUser, getSingleUser); // this route must be in the last

export default router;
