import { z } from 'zod';
import { insertIngredientSchema, insertProductSchema, ingredients, products } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  stockError: z.object({
    message: z.string(),
    missingIngredients: z.array(z.string()).optional(),
  })
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  ingredients: {
    list: {
      method: 'GET' as const,
      path: '/api/ingredients',
      responses: {
        200: z.array(z.custom<typeof ingredients.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/ingredients/:id',
      responses: {
        200: z.custom<typeof ingredients.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/ingredients',
      input: insertIngredientSchema,
      responses: {
        201: z.custom<typeof ingredients.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/ingredients/:id',
      input: insertIngredientSchema.partial(),
      responses: {
        200: z.custom<typeof ingredients.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/ingredients/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      responses: {
        200: z.array(z.any()), // Complex type with relations
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id',
      responses: {
        200: z.any(), // Complex type with relations
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products',
      input: insertProductSchema.extend({
        ingredients: z.array(z.object({
          ingredientId: z.number(),
          quantityRequired: z.number()
        })).optional()
      }),
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/products/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  sales: {
    create: {
      method: 'POST' as const,
      path: '/api/sales',
      input: z.object({
        productId: z.number(),
        quantity: z.number().min(1)
      }),
      responses: {
        200: z.object({ success: z.boolean(), message: z.string() }),
        400: errorSchemas.stockError,
        404: errorSchemas.notFound,
      }
    }
  }
};

// ============================================
// TYPE HELPERS — Infer types from schemas
// ============================================
export type CreateIngredientRequest = z.infer<typeof api.ingredients.create.input>;
export type IngredientResponse = z.infer<typeof api.ingredients.create.responses[201]>;
export type IngredientUpdateInput = z.infer<typeof api.ingredients.update.input>;
export type IngredientsListResponse = z.infer<typeof api.ingredients.list.responses[200]>;

export type CreateProductRequest = z.infer<typeof api.products.create.input>;
export type ProductResponse = z.infer<typeof api.products.create.responses[201]>;

export type SaleRequest = z.infer<typeof api.sales.create.input>;

export type ValidationError = z.infer<typeof errorSchemas.validation>;
export type NotFoundError = z.infer<typeof errorSchemas.notFound>;
export type InternalError = z.infer<typeof errorSchemas.internal>;
export type StockError = z.infer<typeof errorSchemas.stockError>;

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
