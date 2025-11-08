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

export type CreateProductFields = z.infer<typeof CreateProductFieldsSchema>;
export type ProductSearchFilters = z.infer<typeof ProductSearchFiltersSchema>;

export const shopRequestSchema = {
    CreateProductFieldsSchema,
    ProductSearchFiltersSchema
}