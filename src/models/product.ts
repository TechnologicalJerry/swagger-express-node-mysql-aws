export interface ProductRecord {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  createdBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProductInput = {
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  createdBy: number | null;
};

export type UpdateProductInput = Partial<Omit<CreateProductInput, 'createdBy'>> & {
  createdBy?: number | null;
};

