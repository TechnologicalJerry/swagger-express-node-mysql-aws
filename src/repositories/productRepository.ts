import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../config/database';
import { CreateProductInput, ProductRecord, UpdateProductInput } from '../models/product';

const mapProduct = (row: RowDataPacket): ProductRecord => ({
  id: row.id,
  uuid: row.uuid,
  name: row.name,
  description: row.description,
  price: Number(row.price),
  stock: row.stock,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const listProducts = async (): Promise<ProductRecord[]> => {
  const db = getPool();
  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM products ORDER BY created_at DESC');
  return rows.map(mapProduct);
};

export const findProductByUuid = async (uuid: string): Promise<ProductRecord | null> => {
  const db = getPool();
  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM products WHERE uuid = ?', [uuid]);
  if (!rows.length) return null;
  return mapProduct(rows[0]);
};

export const createProduct = async (input: CreateProductInput & { uuid: string }): Promise<ProductRecord> => {
  const db = getPool();
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO products (uuid, name, description, price, stock, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [input.uuid, input.name, input.description ?? null, input.price, input.stock, input.createdBy]
  );

  const product = await findProductById(result.insertId);
  if (!product) {
    throw new Error('Failed to retrieve created product');
  }
  return product;
};

export const updateProduct = async (
  uuid: string,
  input: UpdateProductInput
): Promise<ProductRecord | null> => {
  const db = getPool();
  const updates: string[] = [];
  const values: Array<string | number | null> = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    values.push(input.name);
  }
  if (input.description !== undefined) {
    updates.push('description = ?');
    values.push(input.description);
  }
  if (input.price !== undefined) {
    updates.push('price = ?');
    values.push(input.price);
  }
  if (input.stock !== undefined) {
    updates.push('stock = ?');
    values.push(input.stock);
  }

  if (!updates.length) {
    return findProductByUuid(uuid);
  }

  values.push(uuid);

  await db.execute(
    `UPDATE products SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE uuid = ?`,
    values
  );

  return findProductByUuid(uuid);
};

export const deleteProduct = async (uuid: string): Promise<boolean> => {
  const db = getPool();
  const [result] = await db.execute<ResultSetHeader>('DELETE FROM products WHERE uuid = ?', [uuid]);
  return result.affectedRows > 0;
};

const findProductById = async (id: number): Promise<ProductRecord | null> => {
  const db = getPool();
  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
  if (!rows.length) return null;
  return mapProduct(rows[0]);
};

