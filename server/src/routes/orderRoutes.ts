import express, { Router } from 'express';
import {
  authenticateUser,
  authorizePermission,
} from '../middlewares/authentication';
import {
  createOrder,
  getAllOrders,
  getCurrentUserOrders,
  getSingleOrder,
  updateOrder,
} from '../controllers/orderController';

const router: Router = express.Router();

router
  .route('/')
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermission('admin'), getAllOrders);

router.route('/showAllMyOrders').get(authenticateUser, getCurrentUserOrders);

router
  .route('/:id')
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

export default router;
