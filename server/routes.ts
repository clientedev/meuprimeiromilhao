import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SessionStore = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ... middleware setup ...

  // Setup session middleware
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new SessionStore({
        checkPeriod: 86400000,
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "estoque-vivo-secret",
    })
  );

  // Auth Middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.tenantId) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    next();
  };

  // === AUTH ===
  app.post(api.auth.signup.path, async (req, res) => {
    try {
      const input = api.auth.signup.input.parse(req.body);
      const existing = await storage.getTenantByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }
      const tenant = await storage.createTenant(input);
      req.session.tenantId = tenant.id;
      res.status(201).json(tenant);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao criar conta" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password } = api.auth.login.input.parse(req.body);
      const tenant = await storage.getTenantByEmail(email);
      if (!tenant || tenant.password !== password) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      req.session.tenantId = tenant.id;
      res.json(tenant);
    } catch (err) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.session.tenantId) {
      return res.status(401).json({ message: "Não logado" });
    }
    const tenant = await storage.updateTenant(req.session.tenantId, {}); // Get current
    res.json(tenant);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // === INGREDIENTS ===
  app.get(api.ingredients.list.path, requireAuth, async (req, res) => {
    const items = await storage.getIngredients(req.session.tenantId!);
    res.json(items);
  });

  app.post(api.ingredients.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.ingredients.create.input.parse(req.body);
      const item = await storage.createIngredient(req.session.tenantId!, input as any);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao criar ingrediente" });
    }
  });

  app.put(api.ingredients.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.ingredients.update.input.parse(req.body);
      const item = await storage.updateIngredient(Number(req.params.id), req.session.tenantId!, input as any);
      res.json(item);
    } catch (err) {
      res.status(400).json({ message: "Update inválido" });
    }
  });

  app.delete(api.ingredients.delete.path, requireAuth, async (req, res) => {
    await storage.deleteIngredient(Number(req.params.id), req.session.tenantId!);
    res.status(204).send();
  });

  app.post(api.ingredients.importExcel.path, requireAuth, async (req, res) => {
    try {
      const { items } = api.ingredients.importExcel.input.parse(req.body);
      let count = 0;
      for (const item of items) {
        await storage.createIngredient(req.session.tenantId!, item as any);
        count++;
      }
      res.json({ success: true, count });
    } catch (err) {
      res.status(400).json({ message: "Erro na importação" });
    }
  });

  app.post(api.ingredients.scanNF.path, requireAuth, async (req, res) => {
    try {
      const { image } = api.ingredients.scanNF.input.parse(req.body);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em leitura de Notas Fiscais brasileiras. Extraia os itens da nota fiscal na imagem. Retorne APENAS um JSON válido no formato: { \"items\": [ { \"name\": \"string\", \"unit\": \"string\", \"quantity\": number, \"price\": number } ] }. Se não conseguir identificar, retorne um array vazio."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extraia os itens desta nota fiscal:" },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = JSON.parse(response.choices[0].message.content || "{}");
      res.json({ success: true, items: content.items || [] });
    } catch (err) {
      console.error("OCR Error:", err);
      res.status(400).json({ message: "Erro ao processar nota fiscal" });
    }
  });

  // === PRODUCTS ===
  app.get(api.products.list.path, requireAuth, async (req, res) => {
    const items = await storage.getProducts(req.session.tenantId!);
    res.json(items);
  });

  app.post(api.products.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const item = await storage.createProduct(req.session.tenantId!, input as any);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao criar produto" });
    }
  });

  app.delete(api.products.delete.path, requireAuth, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id), req.session.tenantId!);
    res.status(204).send();
  });

  // === SALES ===
  app.post(api.sales.create.path, requireAuth, async (req, res) => {
    try {
      const { productId, quantity } = api.sales.create.input.parse(req.body);
      await storage.processSale(req.session.tenantId!, productId, quantity);
      res.json({ success: true, message: "Venda registrada!" });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erro ao processar venda" });
    }
  });

  // === ADMIN ROUTES ===
  const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.tenantId) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    const tenant = await storage.getTenantById(req.session.tenantId);
    if (!tenant || !tenant.isAdmin) {
      return res.status(403).json({ message: "Acesso negado. Requer privilégios de administrador." });
    }
    next();
  };

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const tenant = await storage.getTenantByEmail(email);
      if (!tenant || tenant.password !== password) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      if (!tenant.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Não é administrador." });
      }
      req.session.tenantId = tenant.id;
      res.json(tenant);
    } catch (err) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.get("/api/admin/me", requireAdmin, async (req, res) => {
    const tenant = await storage.getTenantById(req.session.tenantId!);
    res.json(tenant);
  });

  app.get("/api/admin/tenants", requireAdmin, async (req, res) => {
    const tenants = await storage.getAllTenants();
    res.json(tenants);
  });

  return httpServer;
}

declare module "express-session" {
  interface SessionData {
    tenantId: number;
  }
}
