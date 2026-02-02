import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === INGREDIENTS ===
  app.get(api.ingredients.list.path, async (req, res) => {
    const items = await storage.getIngredients();
    res.json(items);
  });

  app.post(api.ingredients.create.path, async (req, res) => {
    try {
      const input = api.ingredients.create.input.parse(req.body);
      const item = await storage.createIngredient(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.ingredients.update.path, async (req, res) => {
    try {
      const input = api.ingredients.update.input.parse(req.body);
      const item = await storage.updateIngredient(Number(req.params.id), input);
      res.json(item);
    } catch (err) {
      res.status(400).json({ message: "Invalid update" });
    }
  });

  app.delete(api.ingredients.delete.path, async (req, res) => {
    await storage.deleteIngredient(Number(req.params.id));
    res.status(204).send();
  });

  // === PRODUCTS ===
  app.get(api.products.list.path, async (req, res) => {
    const items = await storage.getProducts();
    res.json(items);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const item = await storage.createProduct(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).send();
  });

  // === SALES ===
  app.post(api.sales.create.path, async (req, res) => {
    try {
      const { productId, quantity } = api.sales.create.input.parse(req.body);
      
      await storage.processSale(productId, quantity);
      
      res.json({ success: true, message: "Venda registrada e estoque atualizado!" });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos" });
      }
      // Handle stock errors
      if (err.message.includes("Estoque insuficiente")) {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "Erro ao processar venda" });
    }
  });

  // Seed Data (Optional, but helpful for first run)
  const existing = await storage.getIngredients();
  if (existing.length === 0) {
    console.log("Seeding database...");
    const flour = await storage.createIngredient({ name: "Farinha de Trigo", quantity: 12000, unit: "g", packageSize: 5000 });
    const cheese = await storage.createIngredient({ name: "Queijo Mussarela", quantity: 2000, unit: "g", packageSize: 1000 });
    const tomato = await storage.createIngredient({ name: "Molho de Tomate", quantity: 1000, unit: "ml", packageSize: 500 });

    // Create Pizza Product
    await storage.createProduct({
      name: "Pizza Mussarela",
      price: 4500, // R$ 45,00
      description: "Clássica pizza de mussarela",
      ingredients: [
        { ingredientId: flour.id, quantityRequired: 300 },
        { ingredientId: cheese.id, quantityRequired: 200 },
        { ingredientId: tomato.id, quantityRequired: 100 },
      ]
    });
  }

  return httpServer;
}
