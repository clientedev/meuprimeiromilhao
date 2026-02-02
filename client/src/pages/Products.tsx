import { useProducts, useDeleteProduct, useIngredients } from "@/hooks/use-inventory";
import { ProductForm } from "@/components/ProductForm";
import { Button } from "@/components/ui/button";
import { Pizza, Trash2, ChefHat } from "lucide-react";
import { type ProductWithIngredients } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function Products() {
  const { user } = useAuth();
  const { data: products, isLoading: isLoadingProducts } = useProducts();
  const { data: ingredients, isLoading: isLoadingIngredients } = useIngredients();
  const deleteMutation = useDeleteProduct();

  if (isLoadingProducts || isLoadingIngredients) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const productList = products as unknown as ProductWithIngredients[];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-foreground">Menu de Produtos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os itens disponíveis para venda.</p>
        </div>
        <ProductForm />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productList?.map((product) => {
          const productionCost = product.ingredients?.reduce((sum, pi) => {
            const ingredient = ingredients?.find(i => i.id === pi.ingredientId);
            if (!ingredient || !ingredient.packagePrice || !ingredient.packageSize) return sum;
            return sum + (ingredient.packagePrice / ingredient.packageSize) * pi.quantityRequired;
          }, 0) || 0;
          
          const profit = product.price - productionCost;
          const margin = product.price > 0 ? (profit / product.price) * 100 : 0;

          return (
            <div key={product.id} className="group bg-card rounded-2xl border shadow-sm overflow-hidden card-hover flex flex-col">
              <div className="h-32 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 flex items-center justify-center relative">
                 <Pizza className="h-12 w-12 text-orange-500/50" />
                 <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => {
                        if (confirm("Deletar este produto?")) deleteMutation.mutate(product.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg leading-tight text-foreground">{product.name}</h3>
                  <div className="text-right">
                    <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded-md text-sm block">
                      R$ {(product.price / 100).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 bg-muted/50 p-2 rounded-lg border border-border/50 text-[10px] uppercase tracking-wider font-bold">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Custo</span>
                    <span className="text-foreground">R$ {(productionCost / 100).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-muted-foreground">Lucro</span>
                    <span className={cn(profit > 0 ? "text-green-600" : "text-destructive")}>
                      R$ {(profit / 100).toFixed(2).replace('.', ',')} ({margin.toFixed(0)}%)
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {product.description || "Sem descrição"}
                </p>

                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <ChefHat className="h-3 w-3" />
                    <span className="font-medium uppercase tracking-wider text-foreground">Receita:</span>
                  </div>
                  <ul className="space-y-1">
                    {product.ingredients?.slice(0, 3).map((pi) => (
                      <li key={pi.id} className="text-xs flex justify-between text-muted-foreground">
                        <span>{pi.ingredient.name}</span>
                        <span className="font-mono">
                          {pi.quantityRequired}{pi.ingredient.unit}
                        </span>
                      </li>
                    ))}
                    {(product.ingredients?.length || 0) > 3 && (
                       <li className="text-xs text-muted-foreground italic">+ {product.ingredients!.length - 3} outros...</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}

        {(!productList || productList.length === 0) && (
          <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-3xl border-border bg-muted/20">
            <Pizza className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="font-medium text-lg">Seu menu está vazio</h3>
            <p className="text-sm">Comece criando seu primeiro produto.</p>
          </div>
        )}
      </div>
    </div>
  );
}
