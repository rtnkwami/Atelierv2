import { z } from 'zod';

const CreateProductFieldsSchema = z.object({
  name: z.string(),
  short_description: z.string(),
  long_description: z.string().optional(),
  category: z.string(),
  price: z.number(),
  stock: z.number(),
  images: z.array(z.string()).optional(),
});

const ProductSearchFiltersSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  price: z.object({
    min: z.number(),
    max: z.number(),
  }).optional(),
  stock: z.object({
    min: z.number(),
    max: z.number(),
  }).optional(),
  date: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
  shopId: z.string().optional(),
});

const CreateShopSchema = z.object({
    name: z.string(),
    description: z.string()
});

const UpdateShopInfoSchema = z.object({
    name: z.string(),
    description: z.string()
});

export type CreateProductFields = z.infer<typeof CreateProductFieldsSchema>;
export type ProductSearchFilters = z.infer<typeof ProductSearchFiltersSchema>;
export type CreateShopSchema = z.infer<typeof CreateShopSchema>;
export type UpdateShopInfoSchema = z.infer<typeof UpdateShopInfoSchema>;

export const shopRequestSchema = {
    CreateProductFieldsSchema,
    ProductSearchFiltersSchema,
    CreateShopSchema,
    UpdateShopInfoSchema
}