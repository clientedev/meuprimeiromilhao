import { db } from "./db";
import {
  ingredients, products, productIngredients, tenants,
  type Ingredient, type InsertIngredient, type UpdateIngredientRequest,
  type Product, type InsertProduct, type CreateProductRequest, type ProductWithIngredients,
  type Tenant, type InsertTenant
} from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";

export interface IStorage {
  // Tenants
  getTenantByEmail(email: string): Promise<Tenant | undefined>;
  getTenantById(id: number): Promise<Tenant | undefined>;
  getAllTenants(): Promise<Tenant[]>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: number, updates: Partial<InsertTenant>): Promise<Tenant>;

  // Ingredients
  getIngredients(tenantId: number): Promise<Ingredient[]>;
  getIngredient(id: number, tenantId: number): Promise<Ingredient | undefined>;
  createIngredient(tenantId: number, ingredient: InsertIngredient): Promise<Ingredient>;
  updateIngredient(id: number, tenantId: number, updates: UpdateIngredientRequest): Promise<Ingredient>;
  deleteIngredient(id: number, tenantId: number): Promise<void>;

  // Products
  getProducts(tenantId: number): Promise<ProductWithIngredients[]>;
  getProduct(id: number, tenantId: number): Promise<ProductWithIngredients | undefined>;
  createProduct(tenantId: number, product: CreateProductRequest): Promise<Product>;
  deleteProduct(id: number, tenantId: number): Promise<void>;

  // Sales
  processSale(tenantId: number, productId: number, quantity: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getTenantByEmail(email: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.email, email));
    return tenant;
  }

  async getTenantById(id: number): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async getAllTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants).where(eq(tenants.isAdmin, false)).orderBy(tenants.companyName);
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const [tenant] = await db.insert(tenants).values(insertTenant).returning();
    return tenant;
  }

  async updateTenant(id: number, updates: Partial<InsertTenant>): Promise<Tenant> {
    const [updated] = await db.update(tenants).set(updates).where(eq(tenants.id, id)).returning();
    return updated;
  }

  async getIngredients(tenantId: number): Promise<Ingredient[]> {
    return await db.select().from(ingredients).where(eq(ingredients.tenantId, tenantId)).orderBy(ingredients.name);
  }

  async getIngredient(id: number, tenantId: number): Promise<Ingredient | undefined> {
    const [ingredient] = await db.select().from(ingredients).where(and(eq(ingredients.id, id), eq(ingredients.tenantId, tenantId)));
    return ingredient;
  }

  async createIngredient(tenantId: number, insertIngredient: InsertIngredient): Promise<Ingredient> {
    const [ingredient] = await db.insert(ingredients).values({ ...insertIngredient, tenantId }).returning();
    return ingredient;
  }

  async updateIngredient(id: number, tenantId: number, updates: UpdateIngredientRequest): Promise<Ingredient> {
    const [updated] = await db.update(ingredients)
      .set(updates)
      .where(and(eq(ingredients.id, id), eq(ingredients.tenantId, tenantId)))
      .returning();
    return updated;
  }

  async deleteIngredient(id: number, tenantId: number): Promise<void> {
    await db.delete(ingredients).where(and(eq(ingredients.id, id), eq(ingredients.tenantId, tenantId)));
  }

  async getProducts(tenantId: number): Promise<ProductWithIngredients[]> {
    const allProducts = await db.select().from(products).where(eq(products.tenantId, tenantId));
    
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

  async getProduct(id: number, tenantId: number): Promise<ProductWithIngredients | undefined> {
    const [product] = await db.select().from(products).where(and(eq(products.id, id), eq(products.tenantId, tenantId)));
    if (!product) return undefined;

    const pIngredients = await db.query.productIngredients.findMany({
      where: eq(productIngredients.productId, product.id),
      with: {
        ingredient: true
      }
    });

    return { ...product, ingredients: pIngredients };
  }

  async createProduct(tenantId: number, req: CreateProductRequest): Promise<Product> {
    const { ingredients: ingredientsList, ...productData } = req;
    
    return await db.transaction(async (tx) => {
      const [product] = await tx.insert(products).values({ ...productData, tenantId }).returning();
      
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

  async deleteProduct(id: number, tenantId: number): Promise<void> {
    const product = await this.getProduct(id, tenantId);
    if (!product) return;

    await db.transaction(async (tx) => {
      await tx.delete(productIngredients).where(eq(productIngredients.productId, id));
      await tx.delete(products).where(eq(products.id, id));
    });
  }

  async processSale(tenantId: number, productId: number, quantity: number): Promise<void> {
    await db.transaction(async (tx) => {
      const [product] = await tx.select().from(products).where(and(eq(products.id, productId), eq(products.tenantId, tenantId)));
      if (!product) throw new Error("Produto não encontrado");

      const recipe = await tx.select().from(productIngredients).where(eq(productIngredients.productId, productId));
      
      for (const item of recipe) {
        const [ingredient] = await tx.select().from(ingredients).where(and(eq(ingredients.id, item.ingredientId), eq(ingredients.tenantId, tenantId)));
        if (!ingredient) throw new Error(`Ingrediente ${item.ingredientId} não encontrado`);
        
        const totalNeeded = item.quantityRequired * quantity;
        if (ingredient.quantity < totalNeeded) {
          throw new Error(`Estoque insuficiente de ${ingredient.name}. Necessário: ${totalNeeded}, Disponível: ${ingredient.quantity}`);
        }
      }

      for (const item of recipe) {
        const totalNeeded = item.quantityRequired * quantity;
        await tx.update(ingredients)
          .set({ quantity: sql`${ingredients.quantity} - ${totalNeeded}` })
          .where(and(eq(ingredients.id, item.ingredientId), eq(ingredients.tenantId, tenantId)));
      }
    });
  }
}

export const storage = new DatabaseStorage();
