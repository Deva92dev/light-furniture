import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { checkPermissions } from '../utils/checkPermissions';
import { Review } from '../models/reviewModel';
import { Product } from '../models/productModel';
import { UserRequest } from '../types';

export const createReview = async (req: UserRequest, res: Response) => {
  const { product: productId } = req.body;
  if (!productId) {
    return res.status(StatusCodes.BAD_REQUEST).send('Product ID is required');
  }

  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    res
      .status(StatusCodes.NOT_FOUND)
      .send(`No product with such id : ${productId} found`);
  }

  const isReviewAlreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (isReviewAlreadySubmitted) {
    res.status(StatusCodes.BAD_REQUEST).send('Already Submitted the review');
  }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);

  res.status(StatusCodes.CREATED).json({ review });
};

export const getAllReviews = async (req: Request, res: Response) => {
  const reviews = await Review.find({})
    .populate({
      path: 'product',
      select: 'name company price',
    })
    .populate({ path: 'user', select: 'name' });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

export const getSingleReview = async (req: Request, res: Response) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId })
    .populate({
      path: 'product',
      select: 'name company price',
    })
    .populate({ path: 'user', select: 'name' });
  if (!review) {
    res
      .status(StatusCodes.NOT_FOUND)
      .send(`No review was found with id : ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

export const updateReview = async (req: UserRequest, res: Response) => {
  const { id: reviewId } = req.params;
  const { title, rating, comment } = req.body;
  const review = await Review.findOneAndUpdate({ _id: reviewId });
  if (!review) {
    res
      .status(StatusCodes.NOT_FOUND)
      .send(`No review with id : ${reviewId} found`);
  }

  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

export const deleteReview = async (req: UserRequest, res: Response) => {
  const { id: reviewId } = req.params;
  try {
    const review = await Review.findById({ _id: reviewId });

    if (!review) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(`No review with id : ${reviewId} found`);
    }

    // Ensure user has permissions to delete the review
    checkPermissions(req.user, review.user);

    await Review.deleteOne({ _id: reviewId });
    // Convert ObjectId to string and call calculateAverageRating
    const productId = review.product?.toString();
    if (productId) {
      await Review.calculateAverageRating(productId);
      return res
        .status(StatusCodes.OK)
        .json({ message: 'Review deleted successfully' });
    } else {
      console.error('Error: Product is undefined');
    }

    res.status(StatusCodes.OK).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error deleting review');
  }
};

export const getSingleProductReviews = async (req: Request, res: Response) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
