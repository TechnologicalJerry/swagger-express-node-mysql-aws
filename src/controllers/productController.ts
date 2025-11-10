import { Request, Response } from 'express';
import {
  createNewProduct,
  getProduct,
  getProducts,
  removeProduct,
  updateExistingProduct
} from '../services/productService';
import { asyncHandler } from '../utils/asyncHandler';

export const listProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await getProducts();
  res.json(products);
});

export const getProductByUuid = asyncHandler(async (req: Request, res: Response) => {
  const product = await getProduct(req.params.uuid);
  res.json(product);
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await createNewProduct({
    name: req.body.name,
    description: req.body.description,
    price: Number(req.body.price),
    stock: Number(req.body.stock),
    createdBy: req.user?.id ?? null
  });
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await updateExistingProduct(req.params.uuid, {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price !== undefined ? Number(req.body.price) : undefined,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : undefined
  });
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const deleted = await removeProduct(req.params.uuid);
  if (deleted) {
    res.status(204).send();
    return;
  }
  res.status(404).json({ message: 'Product not found' });
});

