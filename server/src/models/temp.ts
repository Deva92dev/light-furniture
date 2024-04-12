import { ObjectId } from 'mongodb';

const agg = [
  {
    $match: {
      product: new ObjectId('65dce6b871012b0b4c7e95bf'),
    },
  },
  {
    $group: {
      _id: '$product',
      averageRating: {
        $avg: '$rating',
      },
      numOfReviews: {
        $sum: 1,
      },
    },
  },
];
