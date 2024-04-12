import express, { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  uploadImage,
} from '../controllers/productController';
import {
  authenticateUser,
  authorizePermission,
} from '../middlewares/authentication';

import { getSingleProductReviews } from '../controllers/reviewController';

const router: Router = express.Router();

router
  .route('/')
  .post([authenticateUser, authorizePermission('admin')], createProduct)
  .get(getAllProducts);

// upload image router before individual :id routers
router
  .route('/uploadImage')
  .post([authenticateUser, authorizePermission('admin')], uploadImage);

router
  .route('/:id')
  .get(getSingleProduct)
  .patch([authenticateUser, authorizePermission('admin')], updateProduct)
  .delete([authenticateUser, authorizePermission('admin')], deleteProduct);

router.route('/:id/reviews').get(getSingleProductReviews);

export default router;
