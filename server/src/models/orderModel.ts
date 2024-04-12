import mongoose, { Document, Schema, model } from 'mongoose';

export interface IOrder extends Document {
  tax: number;
  shippingFee: number;
  subTotal: number;
  total: number;
  orderItems: ISingleOrderItem[];
  status: string;
  clientSecret: string;
  paymentIntentId: string;
  user: mongoose.Schema.Types.ObjectId;
}

export interface ISingleOrderItem extends Document {
  name: string;
  image: string;
  price: number;
  amount: number;
  product: mongoose.Schema.Types.ObjectId;
}

const SingleOrderItemSchema = new Schema<ISingleOrderItem>({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});

const OrderSchema = new Schema<IOrder>(
  {
    tax: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    orderItems: [SingleOrderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'failed', 'paid', 'delivered', 'cancelled'],
      default: 'pending',
    },
    clientSecret: {
      type: String,
      required: true,
    },
    paymentIntentId: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const Order = model<IOrder>('Order', OrderSchema);
