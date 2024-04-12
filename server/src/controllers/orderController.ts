import { Request, Response } from 'express';
import { Product } from '../models/productModel';
import { Order } from '../models/orderModel';
import { StatusCodes } from 'http-status-codes';
import { UserRequest } from '../types';
import { checkPermissions } from '../utils/checkPermissions';

type StripeType = {
  paymentIntentId?: string;
  amount: number | any;
  currency: string;
};

// if everything correct, only then user can go to checkout page for payment, that is the goal of backend here.
const StripeAPI = async ({ amount, currency, paymentIntentId }: StripeType) => {
  const client_secret = 'someRandomValue';
  return { client_secret, amount };
};

export const createOrder = async (req: UserRequest, res: Response) => {
  const { items: cartItems, tax, shippingFee } = req.body;
  const { paymentIntentId } = req.body;

  if (!cartItems || cartItems.length < 1) {
    res.status(StatusCodes.BAD_REQUEST).send('No cart items were provided');
  }
  if (!tax || !shippingFee) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send('Please provide tax and shipping fee');
  }

  let orderItems: any[] = [];
  let subTotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      res
        .status(StatusCodes.NOT_FOUND)
        .send(`No item with id : ${item.product}`);
    }
    const { name, image, price, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    // add item to order
    orderItems = [...orderItems, singleOrderItem];
    // calculate subTotal
    subTotal += item.amount * price;
  }
  const total = tax + shippingFee + subTotal;
  // get client secret through stripe
  const paymentIntent = await StripeAPI({
    amount: total,
    currency: 'usd',
  });

  const order = await Order.create({
    orderItems,
    total,
    subTotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
    // set carefully
    paymentIntentId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

// can add pagination logic heres
export const getAllOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

export const getSingleOrder = async (req: UserRequest, res: Response) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    res.status(StatusCodes.NOT_FOUND).send(`No such product with : ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

export const getCurrentUserOrders = async (req: UserRequest, res: Response) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

export const updateOrder = async (req: UserRequest, res: Response) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    res.status(StatusCodes.NOT_FOUND).send(`No such product with : ${orderId}`);
  }

  checkPermissions(req.user, order.user);

  // updating the values
  (order.paymentIntentId = paymentIntentId),
    (order.status = 'paid'),
    await order.save();

  res.status(StatusCodes.OK).json({ order });
};
