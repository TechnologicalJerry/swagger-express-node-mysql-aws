import { v4 as uuidv4 } from 'uuid';
import {
  createProduct,
  deleteProduct,
  findProductByUuid,
  listProducts,
  updateProduct
} from '../repositories/productRepository';

export interface CreateProductServiceInput {
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  createdBy: number | null;
}

export interface UpdateProductServiceInput {
  name?: string;
  description?: string | null;
  price?: number;
  stock?: number;
}

export const getProducts = async () => {
  const products = await listProducts();
  return products.map(normalize);
};

export const getProduct = async (uuid: string) => {
  const product = await findProductByUuid(uuid);
  if (!product) {
    throw new Error('Product not found');
  }
  return normalize(product);
};

export const createNewProduct = async (input: CreateProductServiceInput) => {
  const product = await createProduct({
    uuid: uuidv4(),
    name: input.name,
    description: input.description ?? null,
    price: input.price,
    stock: input.stock,
    createdBy: input.createdBy ?? null
  });
  return normalize(product);
};

export const updateExistingProduct = async (uuid: string, input: UpdateProductServiceInput) => {
  const updated = await updateProduct(uuid, input);
  if (!updated) {
    throw new Error('Product not found');
  }
  return normalize(updated);
};

export const removeProduct = async (uuid: string) => deleteProduct(uuid);

const normalize = (product: Awaited<ReturnType<typeof findProductByUuid>>) => {
  if (!product) {
    throw new Error('Product not found');
  }
  return {
    uuid: product.uuid,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    createdBy: product.createdBy,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
};

