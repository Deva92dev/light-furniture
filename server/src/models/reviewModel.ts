import mongoose, { Schema, Document, Model, model } from 'mongoose';

export interface IReview extends Document {
  rating: number;
  title: string;
  comment: string;
  user: mongoose.Schema.Types.ObjectId;
  product: mongoose.Schema.Types.ObjectId;
}

interface IReviewModel extends Model<IReview> {
  model: typeof model;
  // Define custom static methods here
  calculateAverageRating(productId: string): Promise<void>;
}

const ReviewSchema = new Schema<IReview, IReviewModel>(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please Provide a review'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide a review title'],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, 'Please give a review text'],
    },
    // review are tied to user and products
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  { timestamps: true }
);

// so that we have 1 review for per product for per user
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (
  productId: string | never
) {
  // console.log(
  //   'calculateAverageRating method is being executed with productId:',
  //   productId
  // );

  const result = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  console.log(result);

  try {
    if (result.length > 0) {
      await this.model('Product').findOneAndUpdate(
        { _id: productId },
        {
          averageRating: Math.ceil(result[0].averageRating || 0),
          numOfReviews: result[0].numOfReviews || 0,
        }
      );
    } else {
      // If no reviews found, update product with default values
      await this.model('Product').findOneAndUpdate(
        { _id: productId },
        {
          averageRating: 0,
          numOfReviews: 0,
        }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post<IReview>('save', async function () {
  if (this.product) {
    const productId = this.product.toString();
    await (this.constructor as IReviewModel).calculateAverageRating(productId);
  }
});

ReviewSchema.post<IReview>('deleteOne', async function () {
  if (this.product) {
    const productId = this.product.toString();
    await (this.constructor as IReviewModel).calculateAverageRating(productId);
  }
});

export const Review = model<IReview, IReviewModel>('Review', ReviewSchema);
