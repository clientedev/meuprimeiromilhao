import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Ingredients (Raw materials in stock)
export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(0), // Current stock level
  unit: text("unit").notNull(), // e.g., 'grams', 'units', 'ml'
  minStockLevel: integer("min_stock_level").default(10), // Alert threshold
});

// Products (Items for sale, e.g., Pizza)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Stored in cents (R$)
  imageUrl: text("image_url"),
});

// Recipe/Composition (Link between Product and Ingredients)
export const productIngredients = pgTable("product_ingredients", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(), // Intentionally not using FK constraint in schema for simplicity in Lite mode, handled in app logic/relations
  ingredientId: integer("ingredient_id").notNull(),
  quantityRequired: integer("quantity_required").notNull(), // How much of the ingredient is used per 1 product
});

// === RELATIONS ===

export const productsRelations = relations(products, ({ many }) => ({
  ingredients: many(productIngredients),
}));

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  usedIn: many(productIngredients),
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

export const insertIngredientSchema = createInsertSchema(ingredients).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertProductIngredientSchema = createInsertSchema(productIngredients).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

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
