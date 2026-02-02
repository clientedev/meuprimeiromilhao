import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateIngredientRequest, type CreateProductRequest, type SaleRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// === INGREDIENTS ===

export function useIngredients() {
  return useQuery({
    queryKey: [api.ingredients.list.path],
    queryFn: async () => {
      const res = await fetch(api.ingredients.list.path);
      if (!res.ok) throw new Error("Falha ao carregar ingredientes");
      return api.ingredients.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateIngredientRequest) => {
      const res = await fetch(api.ingredients.create.path, {
        method: api.ingredients.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Falha ao criar ingrediente");
      return api.ingredients.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.ingredients.list.path] });
      toast({ title: "Sucesso!", description: "Ingrediente adicionado ao estoque." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível adicionar o ingrediente." });
    }
  });
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<CreateIngredientRequest>) => {
      const url = buildUrl(api.ingredients.update.path, { id });
      const res = await fetch(url, {
        method: api.ingredients.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Falha ao atualizar ingrediente");
      return api.ingredients.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.ingredients.list.path] });
      toast({ title: "Atualizado!", description: "Estoque atualizado com sucesso." });
    },
  });
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.ingredients.delete.path, { id });
      const res = await fetch(url, { method: api.ingredients.delete.method });
      if (!res.ok) throw new Error("Falha ao deletar ingrediente");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.ingredients.list.path] });
      toast({ title: "Removido", description: "Ingrediente removido do estoque." });
    },
  });
}

// === PRODUCTS ===

export function useProducts() {
  return useQuery({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      const res = await fetch(api.products.list.path);
      if (!res.ok) throw new Error("Falha ao carregar produtos");
      return api.products.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateProductRequest) => {
      const res = await fetch(api.products.create.path, {
        method: api.products.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Falha ao criar produto");
      return api.products.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Produto Criado!", description: "Novo item adicionado ao menu." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erro", description: "Verifique os dados e tente novamente." });
    }
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.products.delete.path, { id });
      const res = await fetch(url, { method: api.products.delete.method });
      if (!res.ok) throw new Error("Falha ao deletar produto");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Removido", description: "Produto removido do menu." });
    },
  });
}

// === SALES ===

export function useCreateSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: SaleRequest) => {
      const res = await fetch(api.sales.create.path, {
        method: api.sales.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        if (res.status === 400 && json.missingIngredients) {
           throw new Error(`Faltam ingredientes: ${json.missingIngredients.join(", ")}`);
        }
        throw new Error(json.message || "Falha ao registrar venda");
      }
      return api.sales.create.responses[200].parse(json);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.ingredients.list.path] }); // Update stock immediately
      toast({ title: "Venda Registrada!", description: "Estoque atualizado automaticamente.", className: "bg-green-50 border-green-200 text-green-900" });
    },
    onError: (error) => {
      toast({ 
        variant: "destructive", 
        title: "Estoque Insuficiente", 
        description: error.message 
      });
    }
  });
}
