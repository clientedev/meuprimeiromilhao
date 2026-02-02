import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// SaaS Tenants (Users/Companies)
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name").notNull(),
  companyType: text("company_type").notNull(), // 'hamburger', 'pizza', 'restaurant'
  primaryColor: text("primary_color").default("24 100% 50%"), // Orange default
  logoUrl: text("logo_url"),
  subscriptionActive: boolean("subscription_active").default(false),
  isAdmin: boolean("is_admin").default(false),
});

// Ingredients (Raw materials in stock)
export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(0), // Current stock level in base units (g, ml, un)
  unit: text("unit").notNull(), // 'g', 'ml', 'un'
  packageSize: integer("package_size").notNull().default(1000), // Size of one package in base units
  packageLabel: text("package_label").notNull().default("pacote"), // 'pacote', 'caixa', 'garrafa', etc.
  packagePrice: integer("package_price").notNull().default(0), // Price per package in cents
  minStockLevel: integer("min_stock_level").default(10), // Alert threshold
});

// Products (Items for sale, e.g., Pizza)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Stored in cents (R$)
  imageUrl: text("image_url"),
});

// Recipe/Composition (Link between Product and Ingredients)
export const productIngredients = pgTable("product_ingredients", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  ingredientId: integer("ingredient_id").notNull(),
  quantityRequired: integer("quantity_required").notNull(), // How much of the ingredient is used per 1 product
});

// === RELATIONS ===

export const tenantsRelations = relations(tenants, ({ many }) => ({
  ingredients: many(ingredients),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  ingredients: many(productIngredients),
  tenant: one(tenants, {
    fields: [products.tenantId],
    references: [tenants.id],
  }),
}));

export const ingredientsRelations = relations(ingredients, ({ one, many }) => ({
  usedIn: many(productIngredients),
  tenant: one(tenants, {
    fields: [ingredients.tenantId],
    references: [tenants.id],
  }),
}));

export const productIngredientsRelations = relations(productIngredients, ({ one }) => ({
  product: one(products, {
    fields: [productIngredients.productId],
    references: [products.id],
  }),
  ingredient: one(ingredients, {
    fields: [productIngredients.ingredientId],
    references: [ingredients.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true });
export const insertIngredientSchema = createInsertSchema(ingredients).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertProductIngredientSchema = createInsertSchema(productIngredients).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type ProductIngredient = typeof productIngredients.$inferSelect;
export type InsertProductIngredient = z.infer<typeof insertProductIngredientSchema>;

// Request types
export type CreateIngredientRequest = InsertIngredient;
export type UpdateIngredientRequest = Partial<InsertIngredient>;

export type CreateProductRequest = InsertProduct & {
  ingredients?: { ingredientId: number; quantityRequired: number }[];
};
export type UpdateProductRequest = Partial<InsertProduct>;

export type SaleRequest = {
  productId: number;
  quantity: number;
};

// Response types
export type ProductWithIngredients = Product & {
  ingredients: (ProductIngredient & { ingredient: Ingredient })[];
};
