import { useProducts, useCreateSale } from "@/hooks/use-inventory";
import { type ProductWithIngredients } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Pizza, DollarSign, ChefHat } from "lucide-react";

export default function Sales() {
  const { data: products, isLoading } = useProducts();
  const { mutate: createSale, isPending } = useCreateSale();

  const productList = products as unknown as ProductWithIngredients[];

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-display text-foreground">PDV / Vendas</h1>
        <p className="text-muted-foreground mt-1">Clique para vender. Baixa automática no estoque.</p>
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
          {productList?.map((product) => (
            <button
              key={product.id}
              onClick={() => createSale({ productId: product.id, quantity: 1 })}
              disabled={isPending}
              className="group text-left relative bg-white dark:bg-slate-900 border border-border p-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="absolute top-4 right-4 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <ShoppingCart className="h-5 w-5" />
              </div>

              <div className="mb-4">
                <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 mb-3">
                  <Pizza className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg leading-tight pr-8">{product.name}</h3>
                <p className="text-2xl font-display font-bold text-primary mt-1">
                  R$ {(product.price / 100).toFixed(2)}
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                <ChefHat className="h-3 w-3" />
                <span>Consome: {product.ingredients?.length || 0} ingredientes</span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
