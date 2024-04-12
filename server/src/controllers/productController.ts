import { Request, Response } from 'express';
import { UserRequest } from '../types';
import { Product } from '../models/productModel';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import { Review } from '../models/reviewModel';

export const createProduct = async (req: UserRequest, res: Response) => {
  // body.user from ProductSchema.user
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

export const getAllProducts = async (req: Request, res: Response) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, count: products.length });
};

export const getSingleProduct = async (req: Request, res: Response) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate('reviews');
  if (!product) {
    res
      .status(StatusCodes.NOT_FOUND)
      .send(`No product was found with id : ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    res
      .status(StatusCodes.NOT_FOUND)
      .send(`No product was found with id : ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id: productId } = req.params;
  try {
    const product = await Product.findOne({ _id: productId });

    if (!product) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(`No product was found with id: ${productId}`);
    }

    await product.deleteOne({ _id: productId });
    //deleteMany for associated review deletion
    await Review.deleteMany({ product: productId });

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Product and associated reviews deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send('Error deleting product');
  }
};

export const uploadImage = async (req: Request, res: Response) => {
  // console.log(req.files);
  // console.log(typeof req.files);
  try {
    if (!req.files) {
      res.status(StatusCodes.BAD_REQUEST).send('No file were uploaded');
    }

    const productImage = req.files.image;
    const maxSize = 1024 * 1024;

    // whether productImage is array of images or not
    if (Array.isArray(productImage)) {
      const result = productImage.map(async (file) => {
        if (!file.mimetype.startsWith('image')) {
          res.status(StatusCodes.BAD_REQUEST).send('Please upload an image');
        } else if (file.size > maxSize) {
          res
            .status(StatusCodes.BAD_REQUEST)
            .send('Please upload a file less than 1mb');
        }

        const imageDestinationPath = path.join(
          __dirname,
          '../public/uploads',
          file.name
        );
        await file.mv(imageDestinationPath);
        return { src: `/uploads/${file.name}` };
      });

      const imageArrayData = await Promise.all(result);
      res.status(StatusCodes.OK).json({ image: imageArrayData });
    } else if (productImage) {
      if (!productImage.mimetype.startsWith('image')) {
        res.status(StatusCodes.BAD_REQUEST).send('Please upload an image');
      } else if (productImage.size > maxSize) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .send('Please upload a file less than 1mb');
      }

      const imageDestinationPath = path.join(
        __dirname,
        '../public/uploads',
        productImage.name
      );

      await productImage.mv(imageDestinationPath);
      res.status(StatusCodes.OK).json({
        image: { src: `/uploads/${productImage.name}` },
      });
    } else {
      res.status(StatusCodes.BAD_REQUEST).send('No files uploaded');
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error Uploading Image');
  }
};
