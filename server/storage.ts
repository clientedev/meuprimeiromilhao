import { db } from "./db";
import {
  ingredients, products, productIngredients,
  type Ingredient, type InsertIngredient, type UpdateIngredientRequest,
  type Product, type InsertProduct, type CreateProductRequest, type ProductWithIngredients
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // Ingredients
  getIngredients(): Promise<Ingredient[]>;
  getIngredient(id: number): Promise<Ingredient | undefined>;
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;
  updateIngredient(id: number, updates: UpdateIngredientRequest): Promise<Ingredient>;
  deleteIngredient(id: number): Promise<void>;

  // Products
  getProducts(): Promise<ProductWithIngredients[]>;
  getProduct(id: number): Promise<ProductWithIngredients | undefined>;
  createProduct(product: CreateProductRequest): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Sales (Transactional)
  processSale(productId: number, quantity: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getIngredients(): Promise<Ingredient[]> {
    return await db.select().from(ingredients).orderBy(ingredients.name);
  }

  async getIngredient(id: number): Promise<Ingredient | undefined> {
    const [ingredient] = await db.select().from(ingredients).where(eq(ingredients.id, id));
    return ingredient;
  }

  async createIngredient(insertIngredient: InsertIngredient): Promise<Ingredient> {
    const [ingredient] = await db.insert(ingredients).values(insertIngredient).returning();
    return ingredient;
  }

  async updateIngredient(id: number, updates: UpdateIngredientRequest): Promise<Ingredient> {
    const [updated] = await db.update(ingredients)
      .set(updates)
      .where(eq(ingredients.id, id))
      .returning();
    return updated;
  }

  async deleteIngredient(id: number): Promise<void> {
    await db.delete(ingredients).where(eq(ingredients.id, id));
  }

  async getProducts(): Promise<ProductWithIngredients[]> {
    const allProducts = await db.select().from(products);
    
    // Enrich with ingredients
    const enriched = await Promise.all(allProducts.map(async (p) => {
      const pIngredients = await db.query.productIngredients.findMany({
        where: eq(productIngredients.productId, p.id),
        with: {
          ingredient: true
        }
      });
      return { ...p, ingredients: pIngredients };
    }));

    return enriched;
  }

  async getProduct(id: number): Promise<ProductWithIngredients | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return undefined;

    const pIngredients = await db.query.productIngredients.findMany({
      where: eq(productIngredients.productId, product.id),
      with: {
        ingredient: true
      }
    });

    return { ...product, ingredients: pIngredients };
  }

  async createProduct(req: CreateProductRequest): Promise<Product> {
    const { ingredients: ingredientsList, ...productData } = req;
    
    // Transaction to create product and links
    return await db.transaction(async (tx) => {
      const [product] = await tx.insert(products).values(productData).returning();
      
      if (ingredientsList && ingredientsList.length > 0) {
        await tx.insert(productIngredients).values(
          ingredientsList.map(i => ({
            productId: product.id,
            ingredientId: i.ingredientId,
            quantityRequired: i.quantityRequired
          }))
        );
      }
      
      return product;
    });
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(productIngredients).where(eq(productIngredients.productId, id));
    await db.delete(products).where(eq(products.id, id));
  }

  async processSale(productId: number, quantity: number): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. Get required ingredients
      const recipe = await tx.select().from(productIngredients).where(eq(productIngredients.productId, productId));
      
      if (recipe.length === 0) return; // No ingredients needed, easy sale

      // 2. Check stock
      for (const item of recipe) {
        const [ingredient] = await tx.select().from(ingredients).where(eq(ingredients.id, item.ingredientId));
        if (!ingredient) throw new Error(`Ingredient ${item.ingredientId} not found`);
        
        const totalNeeded = item.quantityRequired * quantity;
        if (ingredient.quantity < totalNeeded) {
          throw new Error(`Estoque insuficiente de ${ingredient.name}. Necessário: ${totalNeeded}, Disponível: ${ingredient.quantity}`);
        }
      }

      // 3. Deduct stock
      for (const item of recipe) {
        const totalNeeded = item.quantityRequired * quantity;
        await tx.update(ingredients)
          .set({ quantity: sql`${ingredients.quantity} - ${totalNeeded}` })
          .where(eq(ingredients.id, item.ingredientId));
      }
    });
  }
}

export const storage = new DatabaseStorage();
