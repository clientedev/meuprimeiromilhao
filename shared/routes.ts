import { z } from 'zod';
import { insertIngredientSchema, insertProductSchema, ingredients, products, insertTenantSchema } from './schema';

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
  auth: {
    signup: {
      method: 'POST' as const,
      path: '/api/auth/signup',
      input: insertTenantSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      }
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      responses: {
        200: z.any(),
        401: z.object({ message: z.string() }),
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me',
      responses: {
        200: z.any(),
        401: z.object({ message: z.string() }),
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.object({ success: z.boolean() }),
      }
    }
  },
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
      input: insertIngredientSchema.omit({ tenantId: true }),
      responses: {
        201: z.custom<typeof ingredients.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/ingredients/:id',
      input: insertIngredientSchema.omit({ tenantId: true }).partial(),
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
    importExcel: {
      method: 'POST' as const,
      path: '/api/ingredients/import',
      input: z.object({
        items: z.array(z.object({
          name: z.string(),
          unit: z.string(),
          quantity: z.number(),
          packageInfo: z.string().optional(),
          minStock: z.number().optional(),
          currentPrice: z.number().optional()
        }))
      }),
      responses: {
        200: z.object({ success: z.boolean(), count: z.number() }),
        400: errorSchemas.validation,
      }
    },
    scanNF: {
      method: 'POST' as const,
      path: '/api/ingredients/scan-nf',
      input: z.object({
        image: z.string(), // Base64 image
      }),
      responses: {
        200: z.object({ 
          success: z.boolean(), 
          items: z.array(z.object({
            name: z.string(),
            unit: z.string(),
            quantity: z.number(),
            price: z.number().optional()
          }))
        }),
        400: errorSchemas.validation,
      }
    }
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
      input: insertProductSchema.omit({ tenantId: true }).extend({
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
    },
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
